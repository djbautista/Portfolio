'use client';

import { useEffect } from 'react';

// Opens the widget when the user presses `/` anywhere on the page, unless a
// text input is already focused (so users typing prose into a form aren't
// hijacked). Escape-to-close is handled by Radix Dialog itself and is not
// part of this hook.
export function useGlobalSlashShortcut(openWidget: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (active instanceof HTMLElement && active.isContentEditable) return;
      event.preventDefault();
      openWidget();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openWidget]);
}
