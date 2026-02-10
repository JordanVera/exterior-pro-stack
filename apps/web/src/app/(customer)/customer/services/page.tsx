"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../../lib/trpc";

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.service.listCategories.query().then(setCategories).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading services...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
        <p className="mt-1 text-gray-500 dark:text-neutral-400">Browse available exterior property services</p>
      </div>

      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
          {category.description && <p className="mb-4 text-sm text-gray-500 dark:text-neutral-400">{category.description}</p>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.services.map((service: any) => (
              <div key={service.id} className="p-5 transition-all bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl hover:shadow-md dark:hover:border-neutral-700">
                <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                {service.description && <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">{service.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    ${Number(service.basePrice).toFixed(2)}
                    <span className="text-sm font-normal text-gray-400 dark:text-neutral-500">
                      /{service.unit === "SQFT" ? "sq ft" : service.unit === "HOUR" ? "hr" : "flat"}
                    </span>
                  </div>
                  <button onClick={() => router.push(`/customer/quotes/request?serviceId=${service.id}`)} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-cyan-600 rounded-lg hover:bg-cyan-700">
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && <div className="py-12 text-center text-gray-500 dark:text-neutral-400">No services available yet.</div>}
    </div>
  );
}
