"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../../../../../lib/trpc";

export default function RequestQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get("serviceId");

  const [services, setServices] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState(preSelectedServiceId || "");
  const [propertyId, setPropertyId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([trpc.service.list.query(), trpc.property.list.query()])
      .then(([s, p]) => { setServices(s); setProperties(p); if (p.length > 0) setPropertyId(p[0].id); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (serviceId) {
      trpc.provider.list.query({ serviceId }).then((p) => { setProviders(p); if (p.length > 0) setProviderId(p[0].id); }).catch(console.error);
    }
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !propertyId || !providerId) { setError("Please fill in all required fields"); return; }
    setSubmitting(true);
    setError("");
    try {
      await trpc.quote.request.mutate({ serviceId, propertyId, providerId, customerNotes: notes || undefined });
      router.push("/customer/quotes");
    } catch (err: any) { setError(err.message || "Failed to request quote"); }
    finally { setSubmitting(false); }
  };

  const selectClass = "block w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request a Quote</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Select a service, property, and provider to get started</p>
      </div>

      {properties.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-yellow-800 dark:text-yellow-400 text-sm">
          You need to add a property first.{" "}
          <button onClick={() => router.push("/customer/properties")} className="font-medium underline">Add Property</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 space-y-5">
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

        <div><label className={labelClass}>Service *</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={selectClass} required>
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.category.name} — {s.name} (${Number(s.basePrice).toFixed(2)}/{s.unit === "SQFT" ? "sq ft" : s.unit === "HOUR" ? "hr" : "flat"})</option>
            ))}
          </select>
        </div>

        <div><label className={labelClass}>Property *</label>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={selectClass} required>
            <option value="">Select a property...</option>
            {properties.map((p) => (<option key={p.id} value={p.id}>{p.address}, {p.city}, {p.state} {p.zip}</option>))}
          </select>
        </div>

        <div><label className={labelClass}>Provider *</label>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className={selectClass} required>
            <option value="">{serviceId ? providers.length === 0 ? "No providers for this service" : "Select a provider..." : "Select a service first"}</option>
            {providers.map((p) => (<option key={p.id} value={p.id}>{p.businessName}{p.serviceArea ? ` (${p.serviceArea})` : ""}</option>))}
          </select>
        </div>

        <div><label className={labelClass}>Notes for provider</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${selectClass} resize-none`} placeholder="Describe what you need, special requirements, etc." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting || properties.length === 0} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? "Requesting..." : "Request Quote"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-gray-700 dark:text-neutral-300 font-medium rounded-lg border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
