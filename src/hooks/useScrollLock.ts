'use client';

import { useEffect } from 'react';

// Mientras haya un pop-up, una hoja o un desplegable abierto, la pantalla de
// detrás no se mueve: solo se hace scroll dentro del pop-up (si tiene hueco).
// Se detecta solo: cualquier capa `fixed inset-0` (fondo de los modales y de
// los menús) o un elemento con `data-scroll-lock` bloquea la página.
const LOCK_SELECTOR = '.fixed.inset-0, [data-scroll-lock]';

let lockedY: number | null = null;

function lockPage() {
  if (lockedY !== null) return;
  lockedY = window.scrollY;
  const b = document.body.style;
  // `position: fixed` en el body es lo único que frena el scroll de fondo también en iOS.
  b.position = 'fixed';
  b.top = `-${lockedY}px`;
  b.left = '0';
  b.right = '0';
  b.width = '100%';
  document.documentElement.style.overflow = 'hidden';
}

function unlockPage() {
  if (lockedY === null) return;
  const y = lockedY;
  lockedY = null;
  const b = document.body.style;
  b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
  const html = document.documentElement;
  html.style.overflow = '';
  // Volver justo donde estaba, sin la animación de scroll suave.
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, y);
  html.style.scrollBehavior = '';
}

/** Se monta una vez en la raíz de la app. */
export function useGlobalScrollLock() {
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      if (document.querySelector(LOCK_SELECTOR)) lockPage(); else unlockPage();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    check();
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); unlockPage(); };
  }, []);
}

/** Compatibilidad: los modales que ya lo llamaban. El bloqueo real lo hace `useGlobalScrollLock`. */
export function useScrollLock() {}
