'use client';

import { motion } from 'motion/react';
import { Counter } from '@/components/ui/counter';
import { STATS } from './data';

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(200,245,66,0.10),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="text-center sm:text-left"
            >
              <p className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl dark:text-brand-lime">
                <Counter
                  value={stat.value}
                  decimals={'decimals' in stat ? stat.decimals : 0}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {stat.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
