"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [addingServiceCatId, setAddingServiceCatId] = useState<string | null>(null);
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcUnit, setSvcUnit] = useState("FLAT");

  const fetchCategories = () => {
    trpc.service.listCategories.query().then(setCategories).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trpc.service.createCategory.mutate({ name: catName, description: catDesc || undefined, icon: catIcon || undefined });
      setCatName(""); setCatDesc(""); setCatIcon(""); setShowCatForm(false); fetchCategories();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateService = async (categoryId: string) => {
    if (!svcName || !svcPrice) return;
    try {
      await trpc.service.createService.mutate({ categoryId, name: svcName, description: svcDesc || undefined, basePrice: Number(svcPrice), unit: svcUnit as any });
      setSvcName(""); setSvcDesc(""); setSvcPrice(""); setSvcUnit("FLAT"); setAddingServiceCatId(null); fetchCategories();
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleService = async (serviceId: string, active: boolean) => {
    try { await trpc.service.updateService.mutate({ id: serviceId, active: !active }); fetchCategories(); }
    catch (err: any) { alert(err.message); }
  };

  const inputClass = "block w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-neutral-500 focus:border-transparent";
  const smallInputClass = "block w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent";

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Catalog</h2>
          <p className="mt-1 text-gray-500 dark:text-neutral-400">Manage categories and services</p>
        </div>
        <button onClick={() => setShowCatForm(!showCatForm)} className="px-4 py-2 font-medium text-white transition-colors bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-neutral-200">
          {showCatForm ? "Cancel" : "+ New Category"}
        </button>
      </div>

      {showCatForm && (
        <form onSubmit={handleCreateCategory} className="p-5 space-y-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl">
          <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name *" className={inputClass} required />
          <input type="text" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Description" className={inputClass} />
          <input type="text" value={catIcon} onChange={(e) => setCatIcon(e.target.value)} placeholder="Icon name" className={inputClass} />
          <button type="submit" className="px-6 py-2 font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-neutral-200">Create Category</button>
        </form>
      )}

      {categories.map((category) => (
        <div key={category.id} className="p-5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
              {category.description && <p className="text-sm text-gray-500 dark:text-neutral-400">{category.description}</p>}
            </div>
            <button onClick={() => setAddingServiceCatId(addingServiceCatId === category.id ? null : category.id)} className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
              + Add Service
            </button>
          </div>

          <div className="space-y-2">
            {category.services.map((service: any) => (
              <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                  <span className="ml-3 text-sm text-gray-500 dark:text-neutral-400">${Number(service.basePrice).toFixed(2)}/{service.unit.toLowerCase()}</span>
                </div>
                <button onClick={() => handleToggleService(service.id, service.active)}
                  className={`text-xs font-medium ${service.active ? "text-red-500 dark:text-red-400 hover:text-red-700" : "text-green-600 dark:text-green-400 hover:text-green-700"}`}
                >{service.active ? "Deactivate" : "Activate"}</button>
              </div>
            ))}
          </div>

          {addingServiceCatId === category.id && (
            <div className="p-3 mt-3 space-y-2 rounded-lg bg-gray-50 dark:bg-neutral-950">
              <input type="text" value={svcName} onChange={(e) => setSvcName(e.target.value)} placeholder="Service name *" className={smallInputClass} />
              <input type="text" value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} placeholder="Description" className={smallInputClass} />
              <div className="flex gap-2">
                <input type="number" step="0.01" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} placeholder="Price *" className={`flex-1 ${smallInputClass}`} />
                <select value={svcUnit} onChange={(e) => setSvcUnit(e.target.value)} className={smallInputClass}>
                  <option value="FLAT">Flat</option>
                  <option value="HOUR">Per Hour</option>
                  <option value="SQFT">Per Sq Ft</option>
                </select>
              </div>
              <button onClick={() => handleCreateService(category.id)} className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded hover:bg-gray-800 dark:hover:bg-neutral-200">Add Service</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
