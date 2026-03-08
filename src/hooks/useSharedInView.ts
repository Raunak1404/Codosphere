import { useEffect, useRef, useState } from 'react';

/**
 * Shared IntersectionObserver for efficient viewport detection.
 * Instead of creating one observer per component (like Framer Motion's useInView),
 * this pools entries through a single observer per threshold value.
 */

type ObserverKey = string;

const observers = new Map<ObserverKey, IntersectionObserver>();
const callbacks = new Map<Element, (isIntersecting: boolean) => void>();

function getOrCreateObserver(threshold: number, once: boolean): IntersectionObserver {
  const key: ObserverKey = `${threshold}-${once}`;

  if (observers.has(key)) {
    return observers.get(key)!;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const cb = callbacks.get(entry.target);
        if (cb) {
          cb(entry.isIntersecting);
          if (once && entry.isIntersecting) {
            observer.unobserve(entry.target);
            callbacks.delete(entry.target);
          }
        }
      });
    },
    { threshold }
  );

  observers.set(key, observer);
  return observer;
}

export function useSharedInView(
  options: { threshold?: number; once?: boolean } = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getOrCreateObserver(threshold, once);

    callbacks.set(el, (isIntersecting) => {
      setInView(isIntersecting);
    });

    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, [threshold, once]);

  return [ref, inView];
}
