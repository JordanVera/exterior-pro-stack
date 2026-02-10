"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");

  const fetchProperties = () => {
    trpc.property.list.query().then(setProperties).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await trpc.property.create.mutate({ address, city, state: state.toUpperCase(), zip, notes: notes || undefined });
      setShowForm(false);
      setAddress(""); setCity(""); setState(""); setZip(""); setNotes("");
      fetchProperties();
    } catch (err: any) { setError(err.message || "Failed to add property"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try { await trpc.property.delete.mutate({ id }); fetchProperties(); }
    catch (err: any) { alert(err.message || "Failed to delete property"); }
  };

  const inputClass = "block w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">Manage properties for service requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors">
          {showForm ? "Cancel" : "+ Add Property"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add New Property</h3>
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
          <div><label className={labelClass}>Street Address *</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelClass}>City *</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>State *</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="TX" className={inputClass} required /></div>
            <div><label className={labelClass}>ZIP *</label><input type="text" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={10} placeholder="75001" className={inputClass} required /></div>
          </div>
          <div><label className={labelClass}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Gate code, special instructions, etc." /></div>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors">
            {saving ? "Adding..." : "Add Property"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {properties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 flex items-start justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{property.address}</div>
              <div className="text-sm text-gray-500 dark:text-neutral-400">{property.city}, {property.state} {property.zip}</div>
              {property.notes && <div className="text-sm text-gray-400 dark:text-neutral-500 mt-1">{property.notes}</div>}
            </div>
            <button onClick={() => handleDelete(property.id)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">Delete</button>
          </div>
        ))}

        {properties.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
            <p>No properties added yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">Add your first property</button>
          </div>
        )}
      </div>
    </div>
  );
}
