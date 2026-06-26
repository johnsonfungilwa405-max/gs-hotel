import { useEffect, useRef } from 'react';

// Attaches an IntersectionObserver that adds 'is-visible' to elements
// carrying the 'reveal' class once they enter the viewport. Used for the
// scroll-reveal motion pattern across the site.
export function useReveal(deps = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current || document;
    const elements = root.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
