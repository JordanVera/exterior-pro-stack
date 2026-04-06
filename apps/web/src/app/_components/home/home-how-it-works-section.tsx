'use client';

import { Card, CardContent } from '@/components/ui/card';

const STEPS = [
  {
    step: '01',
    title: 'Choose a Plan or Post a Job',
    desc: 'Subscribe to recurring services or post a one-time job request with your property details. It takes less than 2 minutes.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Providers Bid',
    desc: 'Verified local providers in your area see your job and submit competitive bids with pricing and availability.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Pick Your Pro',
    desc: 'Compare bids side by side — pricing, provider ratings, and notes. Accept the best fit with one click.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Sit Back & Relax',
    desc: 'Your provider handles everything. Track progress in real time and get notified when work is complete.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
] as const;

export function HomeHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
            Simple Process
          </p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Booked in Minutes, Done Right
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
            Whether you subscribe to a plan or post a one-time job, getting work
            done is fast and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-10">
          {STEPS.map((item) => (
            <Card
              key={item.step}
              className="relative text-center bg-transparent border-0 shadow-none"
            >
              <CardContent className="p-0">
                <div className="inline-flex items-center justify-center mb-6 text-cyan-600 bg-cyan-100 w-14 h-14 rounded-2xl dark:bg-cyan-950/50 dark:text-cyan-400">
                  {item.icon}
                </div>
                <div className="mb-2 text-xs font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                  STEP {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
