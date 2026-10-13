"""Excepciones especializadas para el motor de Inteligencia Artificial Gemini."""

class GeminiAPIError(Exception):
    """Error base para fallos al comunicarse con la API de Google Gemini."""
    pass

class GeminiRateLimitError(GeminiAPIError):
    """Error HTTP 429: Cuota de peticiones agotada (Resource Exhausted)."""
    pass

class GeminiTimeoutError(GeminiAPIError):
    """Timeout al esperar respuesta de inferencia de Gemini (> 14s)."""
    pass

class GeminiResponseParsingError(GeminiAPIError):
    """Fallo al parsear o sanitizar la respuesta estructurada JSON de Gemini."""
    pass

class GeminiAllModelsExhaustedError(GeminiAPIError):
    """Todos los modelos de la cascada fallaron por cuota, timeout o indisponibilidad."""
    pass
