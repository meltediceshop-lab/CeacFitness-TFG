'use client';

// Contenido reutilizado tanto por la tarjeta de bienvenida (primera semana)
// como por el acceso permanente "Tu tabla" desde el Inicio.
export function FitKPhilosophyContent() {
  return (
    <>
      <h2 className="text-base font-bold text-stone-900 dark:text-white mb-2">Tu primera semana ya está lista</h2>
      <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-1.5">
        Esta es tu propuesta para empezar.
      </p>
      <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-3">
        No buscamos el plan perfecto desde el primer día. Preferimos comenzar con algo sencillo e ir adaptándolo contigo conforme entrenes y nos vayamos conociendo.
      </p>
      <p className="text-stone-700 dark:text-stone-200 text-sm font-medium">
        Lo importante ahora no es hacerlo perfecto. Es empezar.
      </p>
    </>
  );
}
