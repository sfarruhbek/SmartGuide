'use client';
import { useEffect, useState } from 'react';

/** Detect actual viewport shrink while editing; resizing a desktop window alone is not a keyboard. */
export function useKeyboardViewport() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const measure = () => {
      const editing = document.activeElement?.matches(
        'input:not([type=checkbox]):not([type=file]),textarea,[contenteditable=true]',
      );
      setOpen(
        Boolean(
          editing &&
            window.innerHeight - viewport.height - viewport.offsetTop > 140,
        ),
      );
    };
    viewport.addEventListener('resize', measure);
    document.addEventListener('focusin', measure);
    document.addEventListener('focusout', measure);
    return () => {
      viewport.removeEventListener('resize', measure);
      document.removeEventListener('focusin', measure);
      document.removeEventListener('focusout', measure);
    };
  }, []);
  return open;
}
