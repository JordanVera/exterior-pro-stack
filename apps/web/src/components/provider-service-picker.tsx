'use client';

import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

function formatServicePrice(price: unknown, unit?: string) {
  const num = Number(price);
  const amount = `$${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
  if (unit === 'SQFT') return `${amount}/sq ft`;
  if (unit === 'HOUR') return `${amount}/hr`;
  return `${amount} flat`;
}

export type CatalogService = {
  id: string;
  name: string;
  basePrice: unknown;
  unit?: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  services: CatalogService[];
};

export function ProviderServicePicker({
  categories,
  value,
  onChange,
  disabled,
}: {
  categories: CatalogCategory[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState<string[]>([]);
  const selected = useMemo(() => new Set(value), [value]);

  const toggle = (serviceId: string) => {
    if (selected.has(serviceId)) {
      onChange(value.filter((id) => id !== serviceId));
      return;
    }
    onChange([...value, serviceId]);
  };

  const toggleCategory = (category: CatalogCategory) => {
    const ids = category.services.map((service) => service.id);
    const allOn = ids.every((id) => selected.has(id));
    if (allOn) {
      const drop = new Set(ids);
      onChange(value.filter((id) => !drop.has(id)));
      return;
    }
    const extra = ids.filter((id) => !selected.has(id));
    onChange([...value, ...extra]);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-input bg-transparent shadow-sm',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className="border-b border-border px-3 py-2.5">
        {value.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {value.length} service{value.length === 1 ? '' : 's'} selected
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select every service you offer
          </p>
        )}
      </div>
      <Accordion
        type="multiple"
        value={open}
        onValueChange={setOpen}
        className="overflow-y-auto px-3 max-h-64"
      >
        {categories.map((category) => {
          if (category.services.length === 0) return null;
          const picked = category.services.filter((service) =>
            selected.has(service.id),
          ).length;
          const allOn = picked === category.services.length;
          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border-border"
            >
              <AccordionTrigger className="py-2.5 text-xs hover:no-underline">
                <span className="flex gap-2 items-center min-w-0">
                  <span className="truncate">{category.name}</span>
                  {picked > 0 ? (
                    <span className="rounded-full bg-brand-lime/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-brand-navy dark:text-brand-lime">
                      {picked}
                    </span>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleCategory(category)}
                  className="mb-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {allOn ? 'Clear category' : 'Select all in category'}
                </button>
                <div className="space-y-1.5">
                  {category.services.map((service) => {
                    const isOn = selected.has(service.id);
                    return (
                      <label
                        key={service.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors',
                          isOn
                            ? 'border-brand-lime/40 bg-brand-lime/10'
                            : 'border-border hover:border-brand-lime/30',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          disabled={disabled}
                          onChange={() => toggle(service.id)}
                          className="w-4 h-4 accent-brand-lime"
                        />
                        <span className="flex-1 min-w-0 text-xs font-medium text-foreground">
                          {service.name}
                        </span>
                        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                          {formatServicePrice(service.basePrice, service.unit)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
