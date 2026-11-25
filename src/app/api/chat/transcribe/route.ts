import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const groq = new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY! });
// Transcripción de las notas de voz del Coach (Whisper en Groq).
const TRANSCRIBE_MODEL = process.env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo';
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'No hay audio' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'El audio es demasiado largo' }, { status: 413 });

  try {
    const result = await groq.audio.transcriptions.create({ file, model: TRANSCRIBE_MODEL, language: 'es' });
    const text = result.text?.trim() ?? '';
    if (!text) return NextResponse.json({ error: 'No se ha entendido el audio' }, { status: 422 });
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[chat transcribe]', err);
    return NextResponse.json({ error: 'No se ha podido transcribir el audio' }, { status: 500 });
  }
}
