'use client';

import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  PropertyAddressForm,
  type CreatedProperty,
} from '@/components/property-address-form';

interface FirstPropertyPromptProps {
  onAdded: (property: CreatedProperty) => void;
}

export function FirstPropertyPrompt({ onAdded }: FirstPropertyPromptProps) {
  return (
    <Card className="border-cyan-500/30 bg-background/80 shadow-none backdrop-blur-xl">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
            <MapPin className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add your first property
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You need a home address before you can request a service.
            </p>
          </div>
        </div>
        <PropertyAddressForm submitLabel="Save property" onSuccess={onAdded} />
      </CardContent>
    </Card>
  );
}
