'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { MAX_SERVICE_ZIPS, US_ZIP } from '@repo/validators';
import {
  HOUSTON_ZIP_GROUPS,
  HOUSTON_ZIP_SET,
  HOUSTON_ZIPS,
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

const MAX_VISIBLE_CHIPS = 10;

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
  const extraZips = useMemo(
    () => zips.filter((zip) => !HOUSTON_ZIP_SET.has(zip)),
    [zips],
  );
  const allHoustonSelected =
    HOUSTON_ZIPS.length > 0 && HOUSTON_ZIPS.every((zip) => selected.has(zip));

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

  const selectAllHouston = () => {
    const next = [...HOUSTON_ZIPS, ...extraZips];
    if (next.length > MAX_SERVICE_ZIPS) {
      setError(`You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`);
      return;
    }
    setError('');
    setZips(next);
  };

  const clearHouston = () => {
    setError('');
    setZips(extraZips);
  };

  const toggleGroup = (group: HoustonZipGroup) => {
    const groupZips = group.zips.map((item) => item.zip);
    const missing = groupZips.filter((zip) => !selected.has(zip));
    setError('');
    if (missing.length === 0) {
      const drop = new Set(groupZips);
      setZips(zips.filter((zip) => !drop.has(zip)));
      return;
    }
    const next = [...zips, ...missing];
    if (next.length > MAX_SERVICE_ZIPS) {
      setError(`You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`);
      return;
    }
    setZips(next);
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

  const visibleZips = allHoustonSelected
    ? extraZips
    : zips.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = allHoustonSelected
    ? 0
    : Math.max(0, zips.length - MAX_VISIBLE_CHIPS);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'overflow-hidden rounded-md border border-input bg-transparent shadow-sm',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <div className="space-y-2 border-b border-border px-3 py-2.5">
          <div className="flex gap-2 justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {zips.length === 0
                ? 'Click the ZIP codes you serve'
                : `${zips.length} ZIP${zips.length === 1 ? '' : 's'} selected`}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={allHoustonSelected ? clearHouston : selectAllHouston}
              aria-label={
                allHoustonSelected
                  ? 'Clear all Greater Houston ZIP codes'
                  : 'Select all Greater Houston ZIP codes'
              }
              className="h-7 shrink-0 px-2.5 text-xs"
            >
              {allHoustonSelected ? 'Clear Greater Houston' : 'Select all'}
            </Button>
          </div>
          {zips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {allHoustonSelected ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-lime/30 bg-brand-lime/10 px-2 py-0.5 text-xs font-medium text-foreground">
                  All Greater Houston
                  <button
                    type="button"
                    onClick={clearHouston}
                    disabled={disabled}
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear Greater Houston ZIP codes"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null}
              {visibleZips.map((zip) => (
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
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {hiddenCount > 0 ? (
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  +{hiddenCount} more
                </span>
              ) : null}
            </div>
          ) : null}
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
              className="pl-8 h-8 text-sm shadow-none border-border bg-background/60 focus-visible:ring-brand-lime"
            />
          </div>
        </div>

        <Accordion
          type="multiple"
          value={open}
          onValueChange={setOpen}
          className="max-h-80 overflow-y-auto px-3 lg:max-h-[22rem]"
        >
          {groups.length === 0 ? (
            <p className="py-6 text-xs text-center text-muted-foreground">
              No Greater Houston ZIPs match that search
            </p>
          ) : (
            groups.map((group) => {
              const picked = group.zips.filter((item) =>
                selected.has(item.zip),
              ).length;
              const allInGroup = picked === group.zips.length;
              return (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="border-border"
                >
                  <AccordionTrigger className="py-2.5 text-xs hover:no-underline">
                    <span className="flex gap-2 items-center min-w-0">
                      <span className="truncate">{group.name}</span>
                      {picked > 0 ? (
                        <span className="rounded-full bg-brand-lime/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-brand-navy dark:text-brand-lime">
                          {picked}
                        </span>
                      ) : null}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleGroup(group)}
                        className="text-[11px] font-medium text-brand-navy hover:underline dark:text-brand-lime"
                      >
                        {allInGroup ? 'Clear this area' : 'Select this area'}
                      </button>
                    </div>
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

        <div className="flex gap-2 items-center px-3 py-2 border-t border-border">
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
            className="px-3 h-8 text-xs shrink-0"
          >
            Add
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
