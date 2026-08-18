'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Exterior photo band for a property card.
 *
 * Falls back to an illustrated placeholder whenever there is no cached photo,
 * which is the norm until GOOGLE_MAPS_API_KEY is configured and for addresses
 * with no Street View or satellite coverage. The band keeps its height either
 * way so cards in a row stay aligned.
 */

export function PropertyPhoto({
  src,
  address,
  className,
}: {
  src?: string | null;
  address: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        !showPhoto && 'bg-brand-lime/[0.07]',
        className,
      )}
    >
      {showPhoto ? (
        <img
          src={src!}
          alt={`Exterior view of ${address}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="object-cover absolute inset-0 w-full h-full"
        />
      ) : (
        <div
          aria-hidden
          className="flex absolute inset-0 justify-center items-center bg-[radial-gradient(circle_at_50%_120%,rgba(163,230,53,0.22),transparent_70%)]"
        >
          <span className="flex justify-center items-center w-10 h-10 rounded-xl border border-brand-lime/30 bg-brand-lime/15">
            <MapPin className="w-4 h-4 text-brand-navy dark:text-brand-lime" />
          </span>
        </div>
      )}
    </div>
  );
}
