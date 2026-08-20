'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Counter } from '@/components/ui/counter';
import { STATS } from './data';

export function StatsSection() {
  return (
    <section className="overflow-hidden relative py-20 bg-brand-navy">
      {/* Background photo at low opacity for texture */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/landing/stats-panorama.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.6]"
        />
        <div className="absolute inset-0 bg-brand-navy/80" />
      </div>

      {/* Lime radial glow from center */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(200,245,66,0.10),transparent_65%)]" />

      {/* Top / bottom hairline accents */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent pointer-events-none via-brand-lime/25" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent pointer-events-none via-brand-lime/25" />

      <div className="relative px-6 mx-auto max-w-6xl">
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
              <p className="text-4xl font-bold tracking-tight text-brand-lime sm:text-5xl">
                <Counter
                  value={stat.value}
                  decimals={'decimals' in stat ? stat.decimals : 0}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-3 text-sm font-semibold text-white">
                {stat.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">
                {stat.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
