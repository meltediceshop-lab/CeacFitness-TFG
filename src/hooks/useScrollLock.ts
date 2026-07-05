'use client';

import { useEffect } from 'react';

export function useScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('modal-open');
    return () => {
      html.classList.remove('modal-open');
    };
  }, []);
}
