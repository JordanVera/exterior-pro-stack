'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

type StickyScrollHorizontalProps = {
  children: React.ReactNode;
  /** Sticky content rendered above the moving track, e.g. a heading. */
  header?: React.ReactNode;
  className?: string;
  trackClassName?: string;
};

/**
 * Pins a section to the viewport and converts downward scrolling into
 * horizontal movement of the track. Below `md` it degrades to a plain
 * swipeable snap row so touch users never lose control of the page scroll.
 */
export function StickyScrollHorizontal({
  children,
  header,
  className,
  trackClassName,
}: StickyScrollHorizontalProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setEnabled(query.matches && !reduced.matches);

    sync();
    query.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setDistance(0);
      return;
    }
    const track = trackRef.current;
    if (!track) return;

    const measure = () =>
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enabled, children]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(rawX, { stiffness: 120, damping: 30, mass: 0.4 });

  if (!enabled) {
    return (
      <div ref={sectionRef} className={className}>
        {header}
        <div
          className={cn(
            'scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none]',
            trackClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {header}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className={cn('flex gap-6 pl-6 will-change-transform', trackClassName)}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
