// Modelo de Groq usado por el Coach, la revisión periódica y nutrición.
// Centralizado aquí: Groq retiró `llama-3.3-70b-versatile` (sep 2026) y al
// estar repetido en 7 sitios dejó el chat y nutrición devolviendo 500.
// GROQ_MODEL permite cambiarlo desde Vercel sin tocar código.
export const COACH_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// gpt-oss es un modelo de razonamiento: sus tokens de razonamiento cuentan
// dentro de max_tokens. En "low" responde completo incluso con límites
// pequeños (p. ej. los 80 tokens del consejo diario de nutrición).
export const COACH_REASONING_EFFORT = 'low' as const;
