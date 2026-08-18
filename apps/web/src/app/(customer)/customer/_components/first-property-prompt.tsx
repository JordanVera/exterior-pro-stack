'use client';

import { MapPin } from 'lucide-react';
import {
  PropertyAddressForm,
  type CreatedProperty,
} from '@/components/property-address-form';

interface FirstPropertyPromptProps {
  onAdded: (property: CreatedProperty) => void;
}

/** Rendered inside the dashboard hero band, so it brings no backdrop of its own. */
export function FirstPropertyPrompt({ onAdded }: FirstPropertyPromptProps) {
  return (
    <div className="p-5 rounded-2xl border backdrop-blur-xl border-brand-lime/25 bg-background/60 sm:p-7">
      <div className="flex gap-3 items-start mb-5">
        <span className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl border border-brand-lime/25 bg-brand-lime/10">
          <MapPin className="w-5 h-5 text-brand-lime" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Add your first property
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We need a home address before you can request a service.
          </p>
        </div>
      </div>
      <PropertyAddressForm submitLabel="Save property" onSuccess={onAdded} />
    </div>
  );
}
