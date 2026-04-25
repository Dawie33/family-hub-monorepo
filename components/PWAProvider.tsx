'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('PWA registered:', registration.scope);
        },
        (error) => {
          console.log('PWA registration failed:', error);
        }
      );
    }
  }, []);

  return null;
}
