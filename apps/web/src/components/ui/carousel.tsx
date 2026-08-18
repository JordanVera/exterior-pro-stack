'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const GUTTER = 'max(1.5rem, calc((100vw - 72rem) / 2))';

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
  /** Rendered to the left of the arrow controls. */
  controlsSlot?: React.ReactNode;
};

/**
 * Horizontal drag/snap carousel. Scrolls natively (so trackpad and touch both
 * work) with scroll-snap, and adds pointer dragging plus arrow controls on top.
 */
export function Carousel({ children, className, controlsSlot }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragState = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
  });

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    syncArrows();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncArrows]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-item]');
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || e.pointerType === 'touch') return;
    dragState.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !dragState.current.active) return;
    const delta = e.clientX - dragState.current.startX;
    dragState.current.moved = Math.abs(delta);
    el.scrollLeft = dragState.current.startScroll - delta;
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !dragState.current.active) return;
    dragState.current.active = false;
    if (el.hasPointerCapture(e.pointerId))
      el.releasePointerCapture(e.pointerId);
  };

  // A drag that travelled far enough should not also trigger the card's link.
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragState.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = 0;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        onScroll={syncArrows}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        // Gutter matches the max-w-6xl page container. scroll-padding must match
        // the padding, otherwise snapping pulls the first card flush to the edge.
        style={{
          paddingInline: GUTTER,
          scrollPaddingInline: GUTTER,
        }}
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-4 [scrollbar-width:none]"
      >
        {children}
      </div>

      <div className="flex gap-4 justify-between items-center px-6 mx-auto mt-6 max-w-6xl">
        <div className="min-w-0">{controlsSlot}</div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            className="flex justify-center items-center w-11 h-11 rounded-full border transition border-border bg-background/70 text-foreground hover:border-brand-lime/50 hover:text-brand-navy disabled:opacity-30 dark:hover:text-brand-lime"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            className="flex justify-center items-center w-11 h-11 rounded-full border transition border-border bg-background/70 text-foreground hover:border-brand-lime/50 hover:text-brand-navy disabled:opacity-30 dark:hover:text-brand-lime"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-carousel-item className={cn('shrink-0 snap-start', className)}>
      {children}
    </div>
  );
}
