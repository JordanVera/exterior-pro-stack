'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Card that leans toward the pointer and lifts its contents slightly for a
 * parallax feel. Movement is capped so text stays readable.
 */
export function WobbleCard({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - (left + width / 2)) / width) * 12;
    const y = ((event.clientY - (top + height / 2)) / height) * 12;
    setOffset({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setOffset({ x: 0, y: 0 });
      }}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${hovered ? 1.015 : 1})`,
        transition: 'transform 0.15s ease-out',
      }}
      className={cn(
        'overflow-hidden relative rounded-3xl border border-white/10 bg-brand-navy',
        containerClassName,
      )}
    >
      <div
        style={{
          transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={cn('h-full', className)}
      >
        {children}
      </div>
    </motion.section>
  );
}
