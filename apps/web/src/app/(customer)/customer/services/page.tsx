'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../../lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.service.listCategories
      .query()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading services...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Services
        </h2>
        <p className="mt-1 text-muted-foreground">
          Browse available exterior property services
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-foreground">
            {category.name}
          </h3>
          {category.description && (
            <p className="mb-4 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.services.map((service: any) => (
              <Card
                key={service.id}
                className="transition-all hover:shadow-md hover:border-cyan-500/50"
              >
                <CardContent className="p-5">
                  <h4 className="font-semibold text-foreground">
                    {service.name}
                  </h4>
                  {service.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      ${Number(service.basePrice).toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /
                        {service.unit === 'SQFT'
                          ? 'sq ft'
                          : service.unit === 'HOUR'
                            ? 'hr'
                            : 'flat'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/customer/quotes/request?serviceId=${service.id}`,
                        )
                      }
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Get Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No services available yet.
        </div>
      )}
    </div>
  );
}
