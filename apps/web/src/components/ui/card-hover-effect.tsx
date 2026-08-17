'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    tag?: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        'grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item.link}
          key={item.title}
          className="block relative p-2 w-full h-full group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-3xl bg-brand-lime/15 dark:bg-brand-navy/80"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            {item.tag ? (
              <span className="text-[11px] font-medium uppercase tracking-wide text-brand-navy dark:text-brand-lime">
                {item.tag}
              </span>
            ) : null}
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        'relative z-20 h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 group-hover:border-brand-lime/50 dark:border-white/[0.2] dark:bg-black dark:group-hover:border-brand-lime/40',
        className,
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <h4
      className={cn(
        'mt-3 font-bold tracking-wide text-neutral-900 dark:text-zinc-100',
        className,
      )}
    >
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <p
      className={cn(
        'mt-3 text-sm tracking-wide leading-relaxed text-neutral-600 dark:text-zinc-400',
        className,
      )}
    >
      {children}
    </p>
  );
};
