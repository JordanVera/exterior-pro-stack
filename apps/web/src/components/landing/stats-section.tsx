'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Counter } from '@/components/ui/counter';
import { STATS } from './data';

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Full-bleed photo at very low opacity for texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/services/landscaping.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-brand-lime/[0.07]" />
      </div>
      {/* Subtle lime radial glow */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(200,245,66,0.12),transparent_70%)]" />

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
