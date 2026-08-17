'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronRight,
  MapPin,
  ArrowLeft,
  Send,
  Check,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import { getCategoryIcon, CATEGORY_COLORS, formatPrice, STEPS } from './utils';

interface JobRequestSectionProps {
  step: number;
  success: boolean;
  categories: any[];
  selectedCategory: any;
  selectedService: any;
  selectedProperty: any;
  properties: any[];
  notes: string;
  submitting: boolean;
  error: string;
  onStepChange: (step: number) => void;
  onReset: () => void;
  onPickCategory: (cat: any) => void;
  onPickService: (svc: any) => void;
  onPickProperty: (prop: any) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => Promise<void>;
}

export function JobRequestSection({
  step,
  success,
  categories,
  selectedCategory,
  selectedService,
  selectedProperty,
  properties,
  notes,
  submitting,
  error,
  onStepChange,
  onReset,
  onPickCategory,
  onPickService,
  onPickProperty,
  onNotesChange,
  onSubmit,
}: JobRequestSectionProps) {
  const router = useRouter();

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-foreground">Request a Job</h2>
        {step > 1 && !success && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 w-3 h-3" />
            Start over
          </Button>
        )}
      </div>

      {/* progress dots */}
      {step > 1 && !success && (
        <div className="flex gap-1 items-center mb-5">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const current = step === num;
            return (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => (done ? onStepChange(num) : undefined)}
                  disabled={!done}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] font-medium transition-all',
                    done && 'cursor-pointer text-cyan-500 hover:text-cyan-400',
                    current && 'text-foreground',
                    !done && !current && 'text-muted-foreground/40',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all',
                      done && 'bg-cyan-500/20 text-cyan-400',
                      current && 'bg-cyan-500 text-white',
                      !done &&
                        !current &&
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="w-3 h-3" /> : num}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-1 w-4 h-px sm:w-8',
                      done
                        ? 'bg-cyan-500/30'
                        : 'bg-border',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* selection chips */}
      {step > 1 && !success && (
        <div className="flex flex-wrap gap-2 items-center mb-5">
          {step >= 2 && selectedCategory && (
            <Badge
              variant="secondary"
              className="rounded-full border-0 gap-1.5 pr-1.5"
            >
              {(() => {
                const Icon = getCategoryIcon(selectedCategory.name);
                return <Icon className="w-3 h-3" />;
              })()}
              {selectedCategory.name}
              <button
                onClick={() => onStepChange(1)}
                className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {step >= 3 && selectedService && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5 pr-1.5"
              >
                {selectedService.name}
                <button
                  onClick={() => onStepChange(2)}
                  className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </>
          )}
          {step >= 4 && selectedProperty && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5 pr-1.5"
              >
                <MapPin className="w-3 h-3" />
                {selectedProperty.address}
                <button
                  onClick={() => onStepChange(3)}
                  className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </>
          )}
        </div>
      )}

      {/* step content */}
      {success ? (
        <Card className="shadow-none backdrop-blur-xl animate-step-enter border-border bg-background/80">
          <CardContent className="py-12 text-center">
            <div className="inline-flex justify-center items-center mb-4 w-16 h-16 rounded-full animate-scale-check bg-green-500/10">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Job Request Submitted
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Providers in your area will be notified and can submit bids.
            </p>
            <div className="flex gap-3 justify-center items-center">
              <Button
                variant="outline"
                onClick={onReset}
                className="rounded-full"
              >
                Request another
              </Button>
              <Button
                onClick={() => router.push('/customer/jobs')}
                className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400"
              >
                View jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div key={step} className="animate-step-enter">
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((cat, i) => {
                const Icon = getCategoryIcon(cat.name);
                const colors = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                const count = cat.services?.length || 0;
                const hasImage = !!cat.image;
                return (
                  <Card
                    key={cat.id}
                    className={cn(
                      'cursor-pointer overflow-hidden border-border bg-background/80 shadow-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
                      hasImage ? 'border' : '',
                    )}
                    onClick={() => onPickCategory(cat)}
                  >
                    <CardContent
                      className={cn(
                        'relative p-4 min-h-[120px] flex flex-col justify-end',
                        hasImage && 'bg-cover bg-center',
                      )}
                      style={
                        hasImage
                          ? {
                              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2)), url(${cat.image})`,
                            }
                          : undefined
                      }
                    >
                      <div className="relative z-10">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                            hasImage ? 'bg-white/20' : colors.bg,
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5',
                              hasImage ? 'text-white' : colors.icon,
                            )}
                          />
                        </div>
                        <div
                          className={cn(
                            'text-sm font-medium',
                            hasImage
                              ? 'text-white drop-shadow-sm'
                              : 'text-foreground',
                          )}
                        >
                          {cat.name}
                        </div>
                        <div
                          className={cn(
                            'text-[11px] mt-0.5',
                            hasImage
                              ? 'text-white/90'
                              : 'text-muted-foreground',
                          )}
                        >
                          {count} service{count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {categories.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                  No services available yet. Check back soon!
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service */}
          {step === 2 && selectedCategory && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(1)}
                className="mb-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 w-3 h-3" />
                Back to categories
              </Button>
              <div className="space-y-2">
                {selectedCategory.services?.map((svc: any) => (
                  <Card
                    key={svc.id}
                    className="cursor-pointer border-border bg-background/80 shadow-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
                    onClick={() => onPickService(svc)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {svc.name}
                        </div>
                        {svc.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {svc.description}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(svc.basePrice, svc.unit)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!selectedCategory.services ||
                  selectedCategory.services.length === 0) && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No services in this category yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Property */}
          {step === 3 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(2)}
                className="mb-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 w-3 h-3" />
                Back to services
              </Button>
              {properties.length === 0 ? (
                <Card className="border-dashed shadow-none backdrop-blur-xl border-border bg-background/80">
                  <CardContent className="py-10 text-center">
                    <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-3 text-sm text-muted-foreground">
                      Add a property to continue.
                    </p>
                    <Button
                      onClick={() => router.push('/customer/settings')}
                      className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400"
                    >
                      <Plus className="mr-1 w-4 h-4" />
                      Add Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {properties.map((prop) => {
                    const isSelected = selectedProperty?.id === prop.id;
                    return (
                      <Card
                        key={prop.id}
                        className={cn(
                          'cursor-pointer border-border bg-background/80 shadow-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
                          isSelected
                            ? 'border-cyan-500 ring-1 ring-cyan-500/20'
                            : 'hover:border-cyan-500/50',
                        )}
                        onClick={() => onPickProperty(prop)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-foreground">
                                {prop.address}
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {prop.city}, {prop.state} {prop.zip}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review + Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(3)}
                className="mb-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 w-3 h-3" />
                Back
              </Button>

              <Card className="overflow-hidden shadow-none backdrop-blur-xl border-border bg-background/80">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Review Your Request
                  </h3>

                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-cyan-500/10">
                        {(() => {
                          const Icon = getCategoryIcon(
                            selectedCategory?.name || '',
                          );
                          return <Icon className="w-4 h-4 text-cyan-400" />;
                        })()}
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          Service
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedService?.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {selectedCategory?.name} &middot;{' '}
                          {formatPrice(
                            selectedService?.basePrice || 0,
                            selectedService?.unit,
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3 items-start">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          Property
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedProperty?.address}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {selectedProperty?.city}, {selectedProperty?.state}{' '}
                          {selectedProperty?.zip}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Notes for providers (optional)
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Describe what you need, special requirements, access instructions..."
                        rows={3}
                        maxLength={2000}
                        className="text-sm resize-none"
                      />
                      <div className="text-right text-[11px] text-muted-foreground">
                        {notes.length}/2000
                      </div>
                    </div>
                  </div>
                </CardContent>

                {error && (
                  <div className="px-5 pb-2">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <div className="px-5 pb-5">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Local providers will be notified and can submit their bids.
                    You&apos;ll choose the best offer.
                  </p>
                  <Button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 animate-spin border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Job Request
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
