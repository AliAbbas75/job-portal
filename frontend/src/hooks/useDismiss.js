import { useEffect, useRef } from 'react';

/**
 * While `open`, calls onClose on a mouse/touch press outside `ref`'s element or on Escape.
 * For menus and dialogs: put `ref` on the menu (with its toggle button) or the dialog box.
 */
export function useDismiss(ref, open, onClose) {
  // The latest onClose, so an inline arrow doesn't re-attach the listeners on every render.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const onPress = (event) => {
      if (!ref.current?.contains(event.target)) close.current();
    };
    const onKey = (event) => event.key === 'Escape' && close.current();
    document.addEventListener('pointerdown', onPress);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open]);
}
