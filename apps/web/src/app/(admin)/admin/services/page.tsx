'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  basePrice: unknown;
  unit: 'FLAT' | 'HOUR' | 'SQFT';
  active: boolean;
  categoryId: string;
};

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  services: ServiceItem[];
};

type CategoryForm = {
  name: string;
  description: string;
  icon: string;
  image: string;
};

type ServiceForm = {
  name: string;
  description: string;
  basePrice: string;
  unit: 'FLAT' | 'HOUR' | 'SQFT';
  categoryId: string;
};

const emptyCategory: CategoryForm = {
  name: '',
  description: '',
  icon: '',
  image: '',
};

const emptyService: ServiceForm = {
  name: '',
  description: '',
  basePrice: '',
  unit: 'FLAT',
  categoryId: '',
};

function priceLabel(service: ServiceItem) {
  return `$${Number(service.basePrice).toFixed(2)}/${service.unit.toLowerCase()}`;
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategory);

  const [svcOpen, setSvcOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [svcForm, setSvcForm] = useState<ServiceForm>(emptyService);

  const fetchCategories = () => {
    trpc.service.listCategoriesAdmin
      .query()
      .then((data) => setCategories(data as unknown as CategoryItem[]))
      .catch((err) => toast.error(err.message || 'Failed to load catalog'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatForm(emptyCategory);
    setCatOpen(true);
  };

  const openEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
    setCatForm({
      name: category.name,
      description: category.description ?? '',
      icon: category.icon ?? '',
      image: category.image ?? '',
    });
    setCatOpen(true);
  };

  const openCreateService = (categoryId: string) => {
    setEditingService(null);
    setSvcForm({ ...emptyService, categoryId });
    setSvcOpen(true);
  };

  const openEditService = (service: ServiceItem) => {
    setEditingService(service);
    setSvcForm({
      name: service.name,
      description: service.description ?? '',
      basePrice: String(Number(service.basePrice)),
      unit: service.unit,
      categoryId: service.categoryId,
    });
    setSvcOpen(true);
  };

  const saveCategory = async () => {
    if (!catForm.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: catForm.name.trim(),
        description: catForm.description.trim() || undefined,
        icon: catForm.icon.trim() || undefined,
        image: catForm.image.trim() || undefined,
      };
      if (editingCategory) {
        await trpc.service.updateCategory.mutate({ id: editingCategory.id, ...payload });
        toast.success('Category updated');
      } else {
        await trpc.service.createCategory.mutate(payload);
        toast.success('Category created');
      }
      setCatOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveService = async () => {
    if (!svcForm.name.trim() || !svcForm.basePrice || !svcForm.categoryId) return;
    setSaving(true);
    try {
      const payload = {
        name: svcForm.name.trim(),
        description: svcForm.description.trim() || undefined,
        basePrice: Number(svcForm.basePrice),
        unit: svcForm.unit,
        categoryId: svcForm.categoryId,
      };
      if (editingService) {
        await trpc.service.updateService.mutate({ id: editingService.id, ...payload });
        toast.success('Service updated');
      } else {
        await trpc.service.createService.mutate(payload);
        toast.success('Service created');
      }
      setSvcOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleService = async (service: ServiceItem) => {
    try {
      await trpc.service.updateService.mutate({
        id: service.id,
        active: !service.active,
      });
      toast.success(service.active ? 'Service deactivated' : 'Service activated');
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deleteCategory = async (category: CategoryItem) => {
    try {
      await trpc.service.deleteCategory.mutate({ id: category.id });
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cannot delete category');
    }
  };

  const deleteService = async (service: ServiceItem) => {
    try {
      await trpc.service.deleteService.mutate({ id: service.id });
      toast.success('Service deleted');
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cannot delete service');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Catalog"
        title="Services"
        subtitle="Categories and services that customers request and providers bid on."
        size="md"
        action={
          <Button onClick={openCreateCategory}>
            <Plus />
            New category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No categories yet"
          description="Create a category, then add services with a base price and unit."
          action={
            <Button onClick={openCreateCategory}>
              <Plus />
              New category
            </Button>
          }
        />
      ) : (
        categories.map((category) => (
          <SectionPanel
            key={category.id}
            title={category.name}
            count={category.services.length}
            headerSlot={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openCreateService(category.id)}>
                  <Plus />
                  Add service
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => deleteCategory(category)}
                >
                  <Trash2 />
                </Button>
              </div>
            }
          >
            {category.description ? (
              <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
            ) : null}
            {category.services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services in this category.</p>
            ) : (
              <ul className="space-y-2">
                {category.services.map((service) => (
                  <li
                    key={service.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5',
                      !service.active && 'opacity-60',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {service.name}
                        {!service.active ? (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Inactive
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {priceLabel(service)}
                        {service.description ? ` · ${service.description}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleService(service)}>
                        {service.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditService(service)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => deleteService(service)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionPanel>
        ))
      )}

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit category' : 'New category'}</DialogTitle>
            <DialogDescription>
              Categories group services on the marketing site and in job requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Name">
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              />
            </Field>
            <Field label="Icon">
              <Input
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                placeholder="droplets"
              />
            </Field>
            <Field label="Image URL">
              <Input
                value={catForm.image}
                onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={saving || !catForm.name.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={svcOpen} onOpenChange={setSvcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit service' : 'New service'}</DialogTitle>
            <DialogDescription>
              Base price is the platform reference; providers can override it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Name">
              <Input
                value={svcForm.name}
                onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={svcForm.description}
                onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <Select
                value={svcForm.categoryId}
                onValueChange={(value) => setSvcForm({ ...svcForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Base price">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={svcForm.basePrice}
                  onChange={(e) => setSvcForm({ ...svcForm, basePrice: e.target.value })}
                />
              </Field>
              <Field label="Unit">
                <Select
                  value={svcForm.unit}
                  onValueChange={(value) =>
                    setSvcForm({ ...svcForm, unit: value as ServiceForm['unit'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="HOUR">Per hour</SelectItem>
                    <SelectItem value="SQFT">Per sq ft</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSvcOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveService}
              disabled={saving || !svcForm.name.trim() || !svcForm.basePrice}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
