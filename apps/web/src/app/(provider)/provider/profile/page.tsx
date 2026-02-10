"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  // Provider services selection
  const [selectedServices, setSelectedServices] = useState<
    Map<string, number | undefined>
  >(new Map());

  useEffect(() => {
    Promise.all([
      trpc.provider.getProfile.query(),
      trpc.service.list.query(),
    ])
      .then(([p, s]) => {
        setProfile(p);
        setAllServices(s);
        setBusinessName(p.businessName);
        setDescription(p.description || "");
        setServiceArea(p.serviceArea || "");

        const selected = new Map<string, number | undefined>();
        p.services.forEach((ps: any) => {
          selected.set(
            ps.service.id,
            ps.customPrice ? Number(ps.customPrice) : undefined
          );
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
      });
      alert("Profile updated!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      const services = Array.from(selectedServices.entries()).map(
        ([serviceId, customPrice]) => ({
          serviceId,
          customPrice,
        })
      );
      await trpc.provider.setServices.mutate({ services });
      alert("Services updated!");
    } catch (err: any) {
      alert(err.message || "Failed to update services");
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const newMap = new Map(selectedServices);
    if (newMap.has(serviceId)) {
      newMap.delete(serviceId);
    } else {
      newMap.set(serviceId, undefined);
    }
    setSelectedServices(newMap);
  };

  if (loading) {
    return <div className="text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
        <p className="text-gray-500 mt-1">
          Manage your business information and services
          {!profile?.verified && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              Pending Verification
            </span>
          )}
        </p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Business Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Area
          </label>
          <input
            type="text"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="e.g., Dallas-Fort Worth metro"
          />
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Services offered */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Services You Offer</h3>
        <p className="text-sm text-gray-500">
          Select the services you provide. You can set custom prices or use the
          base price.
        </p>
        <div className="space-y-2">
          {allServices.map((service) => {
            const isSelected = selectedServices.has(service.id);
            return (
              <div
                key={service.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleService(service.id)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {service.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({service.category.name})
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Base: ${Number(service.basePrice).toFixed(2)}
                </span>
                {isSelected && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Custom $"
                    value={selectedServices.get(service.id) ?? ""}
                    onChange={(e) => {
                      const newMap = new Map(selectedServices);
                      newMap.set(
                        service.id,
                        e.target.value ? Number(e.target.value) : undefined
                      );
                      setSelectedServices(newMap);
                    }}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={handleSaveServices}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Services"}
        </button>
      </div>
    </div>
  );
}
