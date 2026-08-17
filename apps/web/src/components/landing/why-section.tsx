import Image from 'next/image';
import { Bell, Repeat, Scale, ShieldCheck, Target, Users } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { SectionEyebrow } from './section-eyebrow';

function BentoVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex-1 w-full overflow-hidden rounded-xl min-h-[6rem]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 40vw"
        className="object-cover transition duration-500 group-hover/bento:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/50 via-black/10" />
    </div>
  );
}

export function WhySection() {
  return (
    <section className="py-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <SectionEyebrow>Why Exterior Pro</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Not just another marketplace.
            <span className="block mt-2 text-muted-foreground">
              A smarter way to manage your property.
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Unlike generic platforms like Thumbtack or Angi, Exterior Pro
            combines subscription-based recurring services with a
            competitive bidding marketplace — built exclusively for exterior
            property work.
          </p>
        </div>

        <BentoGrid className="max-w-none md:auto-rows-[20rem]">
          <BentoGridItem
            className="md:col-span-2"
            title="Exterior-focused"
            description="Purpose-built for outdoor property services, not a generic marketplace."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                alt="Modern home exterior with a manicured lawn"
              />
            }
            icon={<Target className="w-4 h-4 text-cyan-500" />}
          />
          <BentoGridItem
            title="Verified providers"
            description="Every provider is vetted before they can bid on jobs on our platform."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80"
                alt="Professional mowing a residential lawn"
              />
            }
            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          />
          <BentoGridItem
            title="Competitive bidding"
            description="Providers compete for your business. You pick the best price, rating, and fit."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
                alt="Comparing service quotes on a laptop"
              />
            }
            icon={<Scale className="w-4 h-4 text-cyan-500" />}
          />
          <BentoGridItem
            className="md:col-span-2"
            title="Subscription plans"
            description="Set up a plan and your recurring services happen automatically, every time. Sticky providers stay assigned — no re-bidding."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=80"
                alt="Lush green lawn maintained on a regular schedule"
              />
            }
            icon={<Repeat className="w-4 h-4 text-cyan-500" />}
          />
          <BentoGridItem
            title="Sticky providers"
            description="Once a provider accepts your recurring jobs, they stay assigned."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
                alt="Crew working together on an exterior job site"
              />
            }
            icon={<Users className="w-4 h-4 text-cyan-500" />}
          />
          <BentoGridItem
            className="md:col-span-2"
            title="Instant notifications"
            description="SMS and in-app updates at every stage — new bids, scheduling, and completion."
            header={
              <BentoVisual
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=80"
                alt="Checking job updates on a smartphone"
              />
            }
            icon={<Bell className="w-4 h-4 text-emerald-500" />}
          />
        </BentoGrid>
      </div>
    </section>
  );
}
