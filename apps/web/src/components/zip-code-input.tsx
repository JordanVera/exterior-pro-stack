'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { MAX_SERVICE_ZIPS, US_ZIP } from '@repo/validators';
import {
  HOUSTON_ZIP_GROUPS,
  houstonZipLabel,
  type HoustonZipGroup,
} from '@/content/houston-zips';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function selectedList(value: string) {
  return value ? value.split(',').filter(Boolean) : [];
}

function filterGroups(query: string): HoustonZipGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return HOUSTON_ZIP_GROUPS;

  return HOUSTON_ZIP_GROUPS.flatMap((group) => {
    const nameMatch = group.name.toLowerCase().includes(q);
    const zips = nameMatch
      ? group.zips
      : group.zips.filter(
          (item) =>
            item.zip.includes(q) || item.label.toLowerCase().includes(q),
        );
    return zips.length > 0 ? [{ ...group, zips }] : [];
  });
}

export function ZipCodeInput({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string[]>([]);
  const zips = selectedList(value);
  const selected = useMemo(() => new Set(zips), [zips]);
  const groups = useMemo(() => filterGroups(query), [query]);

  const setZips = (next: string[]) => {
    onChange(next.join(','));
  };

  const toggle = (zip: string) => {
    setError('');
    if (selected.has(zip)) {
      setZips(zips.filter((item) => item !== zip));
      return;
    }
    if (zips.length >= MAX_SERVICE_ZIPS) {
      setError(`You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`);
      return;
    }
    setZips([...zips, zip]);
  };

  const addCustom = () => {
    const zip = custom.trim();
    if (!US_ZIP.test(zip)) {
      setError('Enter a 5-digit ZIP code');
      return;
    }
    if (selected.has(zip)) {
      setError(`${zip} is already selected`);
      return;
    }
    if (zips.length >= MAX_SERVICE_ZIPS) {
      setError(`You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`);
      return;
    }
    setError('');
    setZips([...zips, zip]);
    setCustom('');
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'overflow-hidden rounded-md border border-input bg-transparent shadow-sm',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <div className="space-y-2 border-b border-border px-3 py-2.5">
          {zips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {zips.map((zip) => (
                <span
                  key={zip}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-2 py-0.5 text-xs font-medium text-foreground"
                  title={houstonZipLabel(zip) ?? zip}
                >
                  {zip}
                  <button
                    type="button"
                    onClick={() => toggle(zip)}
                    disabled={disabled}
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${zip}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Click the ZIP codes you serve
            </p>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={id}
              value={query}
              disabled={disabled}
              placeholder="Search city or ZIP"
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                setOpen(
                  next.trim()
                    ? filterGroups(next).map((group) => group.id)
                    : [],
                );
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              className="h-8 border-border bg-background/60 pl-8 text-sm shadow-none focus-visible:ring-brand-lime"
            />
          </div>
        </div>

        <Accordion
          type="multiple"
          value={open}
          onValueChange={setOpen}
          className="max-h-64 overflow-y-auto px-3"
        >
          {groups.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No Greater Houston ZIPs match that search
            </p>
          ) : (
            groups.map((group) => {
              const picked = group.zips.filter((item) =>
                selected.has(item.zip),
              ).length;
              return (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="border-border"
                >
                  <AccordionTrigger className="py-2.5 text-xs hover:no-underline">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{group.name}</span>
                      {picked > 0 ? (
                        <span className="rounded-full bg-brand-lime/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-brand-navy dark:text-brand-lime">
                          {picked}
                        </span>
                      ) : null}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {group.zips.map((item) => {
                        const isOn = selected.has(item.zip);
                        return (
                          <button
                            key={item.zip}
                            type="button"
                            disabled={disabled}
                            title={item.label}
                            aria-pressed={isOn}
                            onClick={() => toggle(item.zip)}
                            className={cn(
                              'rounded-lg border px-2 py-1.5 text-left transition-colors',
                              isOn
                                ? 'border-brand-lime/40 bg-brand-lime/15'
                                : 'border-border hover:border-brand-lime/40 hover:bg-brand-lime/5',
                            )}
                          >
                            <span className="block text-xs font-semibold tabular-nums text-foreground">
                              {item.zip}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })
          )}
        </Accordion>

        <div className="flex items-center gap-2 border-t border-border px-3 py-2">
          <Input
            value={custom}
            disabled={disabled}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="ZIP not listed?"
            onChange={(event) => {
              setError('');
              setCustom(event.target.value.replace(/[^\d]/g, '').slice(0, 5));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustom();
              }
            }}
            className="h-8 text-sm shadow-none focus-visible:ring-brand-lime"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || custom.length !== 5}
            onClick={addCustom}
            className="h-8 shrink-0 px-3 text-xs"
          >
            Add
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
