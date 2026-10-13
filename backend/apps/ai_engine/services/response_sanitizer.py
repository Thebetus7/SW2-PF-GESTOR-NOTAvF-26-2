import json
import re
from typing import Any, Dict
from ..exceptions import GeminiResponseParsingError

def sanitize_gemini_json_response(raw_text: str) -> Dict[str, Any]:
    """
    Sanitiza y decodifica la respuesta en texto sin formato devuelta por la API de Gemini,
    removiendo delimitadores de bloques de código markdown si estuvieran presentes.
    """
    if not raw_text or not raw_text.strip():
        raise GeminiResponseParsingError("La respuesta de Gemini está vacía.")

    cleaned = raw_text.strip()

    # Remover bloques de código markdown: ```json ... ``` o ``` ... ```
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # Intentar parsear directamente
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Si falla, buscar la porción entre el primer { y el último }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace : last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            raise GeminiResponseParsingError(
                f"No se pudo decodificar el fragmento JSON extraído: {exc}. Contenido: {candidate[:150]}"
            ) from exc

    raise GeminiResponseParsingError(
        f"La respuesta no contiene una estructura JSON válida. Contenido recibido: {raw_text[:200]}"
    )
