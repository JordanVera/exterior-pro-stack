"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";
import { toast } from "sonner";

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [serviceAreaZips, setServiceAreaZips] = useState("");
  const [selectedServices, setSelectedServices] = useState<Map<string, number | undefined>>(new Map());

  useEffect(() => {
    Promise.all([trpc.provider.getProfile.query(), trpc.service.list.query()])
      .then(([p, s]) => {
        setProfile(p);
        setAllServices(s);
        setBusinessName(p.businessName);
        setDescription(p.description || "");
        setServiceArea(p.serviceArea || "");
        setServiceAreaZips(p.serviceAreaZips || "");
        const selected = new Map<string, number | undefined>();
        p.services.forEach((ps: any) => {
          selected.set(ps.service.id, ps.customPrice ? Number(ps.customPrice) : undefined);
        });
        setSelectedServices(selected);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await trpc.provider.updateProfile.mutate({
        businessName,
        description: description || undefined,
        serviceArea: serviceArea || undefined,
        serviceAreaZips: serviceAreaZips || undefined,
      });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      const services = Array.from(selectedServices.entries()).map(([serviceId, customPrice]) => ({ serviceId, customPrice }));
      await trpc.provider.setServices.mutate({ services });
      toast.success("Services updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update services");
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const newMap = new Map(selectedServices);
    if (newMap.has(serviceId)) newMap.delete(serviceId); else newMap.set(serviceId, undefined);
    setSelectedServices(newMap);
  };

  const inputClass = "block w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Profile</h2>
        <p className="mt-1 text-gray-500 dark:text-neutral-400">
          Manage your business information and services
          {!profile?.verified && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">Pending Verification</span>
          )}
        </p>
      </div>

      <div className="p-6 space-y-4 bg-white border border-gray-200 dark:bg-neutral-900 rounded-xl dark:border-neutral-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Business Information</h3>
        <div>
          <label className={labelClass}>Business Name *</label>
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>Service Area</label>
          <input type="text" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className={inputClass} placeholder="e.g., Dallas-Fort Worth metro" />
        </div>
        <div>
          <label className={labelClass}>Service Area Zip Codes</label>
          <input
            type="text"
            value={serviceAreaZips}
            onChange={(e) => setServiceAreaZips(e.target.value)}
            className={inputClass}
            placeholder="e.g., 75201,75208,75219,76102"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            Comma-separated zip codes where you provide service. This is used to match you with nearby job requests.
          </p>
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <div className="p-6 space-y-4 bg-white border border-gray-200 dark:bg-neutral-900 rounded-xl dark:border-neutral-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Services You Offer</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">Select the services you provide. You can set custom prices or use the base price.</p>
        <div className="space-y-2">
          {allServices.map((service) => {
            const isSelected = selectedServices.has(service.id);
            return (
              <div key={service.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isSelected ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30" : "border-gray-200 dark:border-neutral-800"
              }`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleService(service.id)} className="w-4 h-4 text-green-600 rounded" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-neutral-400">({service.category.name})</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-neutral-400">Base: ${Number(service.basePrice).toFixed(2)}</span>
                {isSelected && (
                  <input type="number" step="0.01" min="0" placeholder="Custom $"
                    value={selectedServices.get(service.id) ?? ""}
                    onChange={(e) => { const newMap = new Map(selectedServices); newMap.set(service.id, e.target.value ? Number(e.target.value) : undefined); setSelectedServices(newMap); }}
                    className="w-24 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  />
                )}
              </div>
            );
          })}
        </div>
        <button onClick={handleSaveServices} disabled={saving} className="px-6 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Services"}
        </button>
      </div>
    </div>
  );
}
