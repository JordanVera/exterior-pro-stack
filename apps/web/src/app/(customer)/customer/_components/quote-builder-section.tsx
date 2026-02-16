'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronRight,
  MapPin,
  ArrowLeft,
  Send,
  Check,
  AlertCircle,
  Plus,
  X,
  Building2,
  RotateCcw,
} from 'lucide-react';
import {
  getCategoryIcon,
  CATEGORY_COLORS,
  formatPrice,
  STEPS,
} from './utils';

interface QuoteBuilderSectionProps {
  step: number;
  success: boolean;
  categories: any[];
  selectedCategory: any;
  selectedService: any;
  selectedProperty: any;
  selectedProvider: any;
  properties: any[];
  providers: any[];
  loadingProviders: boolean;
  notes: string;
  submitting: boolean;
  error: string;
  onStepChange: (step: number) => void;
  onReset: () => void;
  onPickCategory: (cat: any) => void;
  onPickService: (svc: any) => void;
  onPickProperty: (prop: any) => void;
  onPickProvider: (prov: any) => void;
  onNotesChange: (notes: string) => void;
  onContinueToReview: () => void;
  onSubmit: () => Promise<void>;
}

export function QuoteBuilderSection({
  step,
  success,
  categories,
  selectedCategory,
  selectedService,
  selectedProperty,
  selectedProvider,
  properties,
  providers,
  loadingProviders,
  notes,
  submitting,
  error,
  onStepChange,
  onReset,
  onPickCategory,
  onPickService,
  onPickProperty,
  onPickProvider,
  onNotesChange,
  onContinueToReview,
  onSubmit,
}: QuoteBuilderSectionProps) {
  const router = useRouter();

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Get a Quote
        </h2>
        {step > 1 && !success && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="px-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Start over
          </Button>
        )}
      </div>

      {/* progress dots */}
      {step > 1 && !success && (
        <div className="flex items-center gap-1 mb-5">
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
                    done && 'text-cyan-500 cursor-pointer hover:text-cyan-400',
                    current && 'text-neutral-900 dark:text-white',
                    !done &&
                      !current &&
                      'text-neutral-300 dark:text-neutral-700',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all',
                      done && 'bg-cyan-500/20 text-cyan-400',
                      current && 'bg-cyan-500 text-white',
                      !done &&
                        !current &&
                        'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600',
                    )}
                  >
                    {done ? <Check className="w-3 h-3" /> : num}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-4 sm:w-8 h-px mx-1',
                      done
                        ? 'bg-cyan-500/30'
                        : 'bg-neutral-200 dark:bg-neutral-800',
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
        <div className="flex flex-wrap items-center gap-2 mb-5">
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
                className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {step >= 3 && selectedService && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5 pr-1.5"
              >
                {selectedService.name}
                <button
                  onClick={() => onStepChange(2)}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </>
          )}
          {step >= 4 && selectedProperty && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5 pr-1.5"
              >
                <MapPin className="w-3 h-3" />
                {selectedProperty.address}
                <button
                  onClick={() => onStepChange(3)}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </>
          )}
          {step >= 5 && selectedProvider && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 gap-1.5"
              >
                <Building2 className="w-3 h-3" />
                {selectedProvider.businessName}
              </Badge>
            </>
          )}
        </div>
      )}

      {/* step content */}
      {success ? (
        <Card className="shadow-none animate-step-enter">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full animate-scale-check bg-green-500/10">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white">
              Quote Request Sent
            </h3>
            <p className="mb-6 text-sm text-neutral-500">
              You&apos;ll be notified when the provider responds.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={onReset}
                className="rounded-full"
              >
                Request another
              </Button>
              <Button
                onClick={() => router.push('/customer/quotes')}
                className="rounded-full bg-cyan-500 hover:bg-cyan-400"
              >
                View quotes
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
                      'cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 overflow-hidden',
                      hasImage
                        ? 'border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        : 'hover:border-neutral-300 dark:hover:border-neutral-700',
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
                              : 'text-neutral-900 dark:text-white',
                          )}
                        >
                          {cat.name}
                        </div>
                        <div
                          className={cn(
                            'text-[11px] mt-0.5',
                            hasImage
                              ? 'text-white/90'
                              : 'text-neutral-400 dark:text-neutral-600',
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
                <div className="py-12 text-sm text-center col-span-full text-neutral-500">
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
                className="px-2 mb-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to categories
              </Button>
              <div className="space-y-2">
                {selectedCategory.services?.map((svc: any) => (
                  <Card
                    key={svc.id}
                    className="cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                    onClick={() => onPickService(svc)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {svc.name}
                        </div>
                        {svc.description && (
                          <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {svc.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center flex-shrink-0 gap-3 ml-4">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {formatPrice(svc.basePrice, svc.unit)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!selectedCategory.services ||
                  selectedCategory.services.length === 0) && (
                  <div className="py-8 text-sm text-center text-neutral-500">
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
                className="px-2 mb-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to services
              </Button>
              {properties.length === 0 ? (
                <Card className="border-dashed shadow-none">
                  <CardContent className="py-10 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                    <p className="mb-3 text-sm text-neutral-500">
                      Add a property to continue.
                    </p>
                    <Button
                      onClick={() => router.push('/customer/settings')}
                      className="rounded-full bg-cyan-500 hover:bg-cyan-400"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {properties.map((prop) => (
                    <Card
                      key={prop.id}
                      className="cursor-pointer shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-neutral-300 dark:hover:border-neutral-700"
                      onClick={() => onPickProperty(prop)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate text-neutral-900 dark:text-white">
                              {prop.address}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {prop.city}, {prop.state} {prop.zip}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Provider + Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(3)}
                className="px-2 mb-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to properties
              </Button>

              {loadingProviders ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : providers.length === 0 ? (
                <Card className="border-dashed shadow-none">
                  <CardContent className="py-10 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                    <p className="text-sm text-neutral-500">
                      No providers available for this service yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                      Select a provider
                    </label>
                    {providers.map((prov) => {
                      const isSelected = selectedProvider?.id === prov.id;
                      return (
                        <Card
                          key={prov.id}
                          className={cn(
                            'cursor-pointer shadow-none transition-all duration-200',
                            isSelected
                              ? 'border-cyan-500 ring-1 ring-cyan-500/20'
                              : 'hover:border-neutral-300 dark:hover:border-neutral-700',
                          )}
                          onClick={() => onPickProvider(prov)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback
                                  className={cn(
                                    'text-xs font-semibold transition-colors',
                                    isSelected
                                      ? 'bg-cyan-500 text-white'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
                                  )}
                                >
                                  {prov.businessName?.[0]?.toUpperCase() || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                  {prov.businessName}
                                </div>
                                {prov.serviceArea && (
                                  <div className="text-xs text-neutral-500 mt-0.5">
                                    {prov.serviceArea}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="flex-shrink-0 w-4 h-4 text-cyan-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                      Notes (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      placeholder="Describe what you need, special requirements..."
                      rows={3}
                      maxLength={2000}
                      className="text-sm resize-none"
                    />
                    <div className="text-right text-[11px] text-neutral-400">
                      {notes.length}/2000
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <Button
                    onClick={onContinueToReview}
                    className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400"
                  >
                    Continue to Review
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(4)}
                className="px-2 mb-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 h-7"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Button>

              <Card className="overflow-hidden shadow-none">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Review Your Request
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10">
                        {(() => {
                          const Icon = getCategoryIcon(
                            selectedCategory?.name || '',
                          );
                          return <Icon className="w-4 h-4 text-cyan-400" />;
                        })()}
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500">
                          Service
                        </div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {selectedService?.name}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {selectedCategory?.name} &middot;{' '}
                          {formatPrice(
                            selectedService?.basePrice || 0,
                            selectedService?.unit,
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500">
                          Property
                        </div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {selectedProperty?.address}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {selectedProperty?.city}, {selectedProperty?.state}{' '}
                          {selectedProperty?.zip}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500">
                          Provider
                        </div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {selectedProvider?.businessName}
                        </div>
                        {selectedProvider?.serviceArea && (
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {selectedProvider.serviceArea}
                          </div>
                        )}
                      </div>
                    </div>

                    {notes && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-[11px] text-neutral-500 mb-1">
                            Notes
                          </div>
                          <div className="text-sm text-neutral-700 dark:text-neutral-300">
                            {notes}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>

                {error && (
                  <div className="px-5 pb-2">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <div className="px-5 pb-5">
                  <Button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Quote Request
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
