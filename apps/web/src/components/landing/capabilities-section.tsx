import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { CAPABILITY_CARDS } from './data';

export function CapabilitiesSection() {
  return (
    <section className="relative py-12">
      <InfiniteMovingCards
        items={CAPABILITY_CARDS}
        direction="left"
        speed="slow"
        className="max-w-full"
      />
    </section>
  );
}
