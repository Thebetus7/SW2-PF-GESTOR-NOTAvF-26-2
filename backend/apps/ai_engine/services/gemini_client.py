import base64
import json
import logging
from typing import Any, Dict, List, Optional
import requests
from django.conf import settings

from ..exceptions import (
    GeminiAllModelsExhaustedError,
    GeminiAPIError,
    GeminiRateLimitError,
    GeminiTimeoutError,
)
from .response_sanitizer import sanitize_gemini_json_response

logger = logging.getLogger(__name__)

DEFAULT_MODELS_CASCADE = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
]

class GeminiResilientClient:
    """
    Cliente de Google Gemini API v1beta diseñado para la capa gratuita (Free Tier),
    implementando Cascade Fallback ante cuotas agotadas (HTTP 429) o timeouts.
    """

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(
        self,
        api_key: Optional[str] = None,
        models_cascade: Optional[List[str]] = None,
        timeout_seconds: int = 14,
    ):
        self.api_key = api_key or getattr(settings, "GEMINI_API_KEY", "")
        self.models_cascade = models_cascade or DEFAULT_MODELS_CASCADE
        self.timeout_seconds = timeout_seconds

    def evaluate_exam_multimodal(
        self,
        prompt: str,
        images_base64: List[str],
        mime_type: str = "image/jpeg",
    ) -> Dict[str, Any]:
        """
        Envía un prompt estructurado junto con una o varias imágenes de examen manuscrito
        en Base64 hacia los modelos de Gemini en cascada de resiliencia.
        """
        if not self.api_key or self.api_key == "demo_gemini_api_key_free_tier":
            logger.warning("GEMINI_API_KEY no configurada o es de demo. Retornando respuesta sintética simulada.")
            return self._generate_mock_evaluation()

        parts: List[Dict[str, Any]] = [{"text": prompt}]
        for img_b64 in images_base64:
            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": img_b64,
                }
            })

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.15,
                "responseMimeType": "application/json",
            },
        }

        errors_accumulated = []

        for model_name in self.models_cascade:
            endpoint_url = f"{self.BASE_URL}/{model_name}:generateContent?key={self.api_key}"
            logger.info("Iniciando inferencia multimodal con modelo Gemini: %s", model_name)

            try:
                response = requests.post(
                    endpoint_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=self.timeout_seconds,
                )

                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise GeminiAPIError("Respuesta sin candidatos de generación.")

                    content_parts = candidates[0].get("content", {}).get("parts", [])
                    if not content_parts or "text" not in content_parts[0]:
                        raise GeminiAPIError("Candidato sin contenido de texto.")

                    raw_text = content_parts[0]["text"]
                    parsed = sanitize_gemini_json_response(raw_text)
                    logger.info("Inferencia exitosa con modelo: %s", model_name)
                    return parsed

                if response.status_code == 429:
                    logger.warning("Modelo %s devolvió HTTP 429 (Resource Exhausted). Probando siguiente...", model_name)
                    errors_accumulated.append(f"{model_name}: HTTP 429 Quota Exceeded")
                    continue

                if response.status_code >= 500:
                    logger.warning("Modelo %s devolvió error de servidor %s. Probando siguiente...", model_name, response.status_code)
                    errors_accumulated.append(f"{model_name}: Server Error {response.status_code}")
                    continue

                # Otros errores de cliente (400, 403, etc.)
                err_msg = f"{model_name}: HTTP {response.status_code} - {response.text}"
                logger.error("Error en llamada Gemini: %s", err_msg)
                errors_accumulated.append(err_msg)

            except requests.Timeout:
                logger.warning("Timeout de %ss en modelo %s. Probando siguiente modelo...", self.timeout_seconds, model_name)
                errors_accumulated.append(f"{model_name}: Timeout ({self.timeout_seconds}s)")
                continue

            except Exception as exc:
                logger.exception("Excepción no controlada con modelo %s: %s", model_name, exc)
                errors_accumulated.append(f"{model_name}: {str(exc)}")
                continue

        logger.critical("Todos los modelos de la cascada Gemini fallaron: %s", errors_accumulated)
        raise GeminiAllModelsExhaustedError(
            f"Cascade Fallback agotado. Errores: {'; '.join(errors_accumulated)}"
        )

    def _generate_mock_evaluation(self) -> Dict[str, Any]:
        """Generador simulado para pruebas de desarrollo o sin API key real activa."""
        return {
            "student_identifier_detected": "EST-DEMO-01",
            "student_name_detected": "Estudiante Demostración",
            "ocr_confidence": 0.95,
            "components_evaluation": [
                {
                    "component_id": 1,
                    "score_assigned": 10.0,
                    "max_score": 10.0,
                    "is_correct": True,
                    "transcribed_answer": "Respuesta manuscrita legible detectada correctamente",
                    "feedback": "Criterios semánticos cumplidos en su totalidad según la tolerancia definida.",
                }
            ],
            "total_score": 10.0,
            "overall_feedback": "Examen evaluado con precisión asistida.",
        }
