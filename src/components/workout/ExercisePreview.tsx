'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell } from 'lucide-react';
import { resolveExercise, type Equipment } from '@/lib/exerciseImages';

// Muestra el preview de un ejercicio. Alterna inicio→fin para simular movimiento.
// Si la imagen principal falla → respaldo por grupo muscular → icono.
export function ExercisePreview({
  name,
  muscle,
  equipment,
  className = '',
  animate = true,
  rounded = 'rounded-2xl',
}: {
  name: string;
  muscle?: string;
  equipment?: Equipment;
  className?: string;
  animate?: boolean;
  rounded?: string;
}) {
  const resolved = useMemo(() => resolveExercise(name, { muscle, equipment }), [name, muscle, equipment]);
  const [errorLevel, setErrorLevel] = useState(0); // 0=principal, 1=respaldo músculo, 2=icono
  const [frame, setFrame] = useState(0);
  const [hasEnd, setHasEnd] = useState(false);

  useEffect(() => {
    setErrorLevel(0);
    setFrame(0);
    setHasEnd(false);
  }, [resolved.start, resolved.end]);

  // Precarga el fotograma final para saber si se puede animar
  useEffect(() => {
    if (!resolved.end || !animate) return;
    const img = new window.Image();
    img.onload = () => setHasEnd(true);
    img.onerror = () => setHasEnd(false);
    img.src = resolved.end;
  }, [resolved.end, animate]);

  // Animación inicio↔fin
  useEffect(() => {
    if (!animate || errorLevel !== 0 || !hasEnd) return;
    const t = setInterval(() => setFrame(f => (f === 0 ? 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [animate, errorLevel, hasEnd]);

  if (errorLevel >= 2 || (!resolved.start && !resolved.fallback)) {
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-stone-800 ${rounded} ${className}`}>
        <Dumbbell className="w-1/3 h-1/3 text-stone-300 dark:text-stone-600" />
      </div>
    );
  }

  const src = errorLevel === 0 ? (frame === 1 && hasEnd ? resolved.end : resolved.start) : resolved.fallback;

  return (
    <div className={`overflow-hidden bg-stone-100 dark:bg-stone-800 ${rounded} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="w-full h-full object-contain transition-opacity duration-300"
        onError={() => setErrorLevel(l => (l === 0 && resolved.fallback ? 1 : 2))}
      />
    </div>
  );
}