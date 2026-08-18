"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "../../../../lib/trpc";
import { clearToken } from "../../../../lib/auth";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionPanel } from "@/components/dashboard/section-panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Phone,
  Calendar,
  Sun,
  LogOut,
  ChevronRight,
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const fetchData = () => {
    Promise.all([trpc.auth.me.query(), trpc.property.list.query()])
      .then(([u, p]) => {
        setUser(u);
        setProperties(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError("");
    try {
      await trpc.property.create.mutate({
        address: addForm.address,
        city: addForm.city,
        state: addForm.state.toUpperCase(),
        zip: addForm.zip,
        notes: addForm.notes || undefined,
      });
      toast.success("Property added successfully");
      setShowAdd(false);
      setAddForm({ address: "", city: "", state: "", zip: "", notes: "" });
      fetchData();
    } catch (err: any) {
      const msg = err.message || "Failed to add property";
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAddSaving(false);
    }
  };

  const startEdit = (prop: any) => {
    setEditingId(prop.id);
    setEditForm({
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip: prop.zip,
      notes: prop.notes || "",
    });
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    setEditError("");
    try {
      await trpc.property.update.mutate({
        id: editingId,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state.toUpperCase(),
        zip: editForm.zip,
        notes: editForm.notes || undefined,
      });
      toast.success("Property updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      const msg = err.message || "Failed to update property";
      setEditError(msg);
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await trpc.property.delete.mutate({ id: deleteId });
      toast.success("Property deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete property");
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const startEditProfile = () => {
    setProfileForm({
      firstName: user?.customerProfile?.firstName || "",
      lastName: user?.customerProfile?.lastName || "",
      email: user?.customerProfile?.email || "",
    });
    setProfileError("");
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileError("First and last name are required");
      return;
    }
    setProfileSaving(true);
    setProfileError("");
    try {
      const updated = await trpc.auth.updateCustomerProfile.mutate({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
      });
      setUser((prev: any) =>
        prev ? { ...prev, customerProfile: { ...prev.customerProfile, ...updated } } : prev,
      );
      toast.success("Profile updated");
      setEditingProfile(false);
    } catch (err: any) {
      const msg = err.message || "Failed to update profile";
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSignOut = async () => {
    await clearToken();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  const phone = user?.phone || "—";
  const firstName = user?.customerProfile?.firstName || "";
  const lastName = user?.customerProfile?.lastName || "";
  const initials =
    ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "?";
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Account"
        size="md"
        title="Settings"
        subtitle="Your profile, properties, and app preferences."
      />

      {/* ── Profile ── */}
      <SectionPanel title="Profile" bodyClassName="p-5">
        <div className="flex gap-3 items-center mb-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="text-sm font-semibold text-white bg-gradient-to-br from-brand-navy to-brand-lime">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
          {!editingProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditProfile}
              className="px-2 h-7 text-xs rounded-full text-brand-navy hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>

        <div>
          {editingProfile ? (
            <div className="space-y-3">
              {profileError && (
                <p className="text-xs text-red-400">{profileError}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="First name"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, firstName: e.target.value })
                  }
                  required
                  className="text-sm"
                />
                <Input
                  placeholder="Last name"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, lastName: e.target.value })
                  }
                  required
                  className="text-sm"
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="flex-1 font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                >
                  <Check className="h-3.5 w-3.5" />
                  {profileSaving ? "Saving…" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <dl className="border-t border-border">
              <div className="flex gap-4 justify-between items-center py-3">
                <dt className="flex gap-3 items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  Phone
                </dt>
                <dd className="font-mono text-sm text-foreground">{phone}</dd>
              </div>
              <Separator />
              <div className="flex gap-4 justify-between items-center py-3">
                <dt className="flex gap-3 items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="text-sm truncate text-foreground">
                  {user?.customerProfile?.email || "—"}
                </dd>
              </div>
              <Separator />
              <div className="flex gap-4 justify-between items-center py-3">
                <dt className="flex gap-3 items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since
                </dt>
                <dd className="text-sm text-foreground">{createdAt}</dd>
              </div>
            </dl>
          )}
        </div>
      </SectionPanel>

      {/* ── Properties ── */}
      <SectionPanel
        title="My properties"
        count={properties.length}
        bare
        headerSlot={
          !showAdd ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(true)}
              className="px-2 h-7 text-xs rounded-full text-brand-navy hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          ) : null
        }
      >
        {/* add form */}
        {showAdd && (
          <div className="p-4 mb-3 rounded-2xl border backdrop-blur-xl animate-step-enter border-brand-lime/30 bg-background/70">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground">
                New property
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full"
                onClick={() => {
                  setShowAdd(false);
                  setAddError("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
                {addError && (
                  <p className="text-xs text-red-400">{addError}</p>
                )}
                <Input
                  placeholder="Street address"
                  value={addForm.address}
                  onChange={(e) =>
                    setAddForm({ ...addForm, address: e.target.value })
                  }
                  required
                  className="text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="City"
                    value={addForm.city}
                    onChange={(e) =>
                      setAddForm({ ...addForm, city: e.target.value })
                    }
                    required
                    className="text-sm"
                  />
                  <Input
                    placeholder="ST"
                    maxLength={2}
                    value={addForm.state}
                    onChange={(e) =>
                      setAddForm({ ...addForm, state: e.target.value })
                    }
                    required
                    className="text-sm"
                  />
                  <Input
                    placeholder="ZIP"
                    maxLength={10}
                    value={addForm.zip}
                    onChange={(e) =>
                      setAddForm({ ...addForm, zip: e.target.value })
                    }
                    required
                    className="text-sm"
                  />
                </div>
                <Textarea
                  placeholder="Notes (gate code, instructions...)"
                  value={addForm.notes}
                  onChange={(e) =>
                    setAddForm({ ...addForm, notes: e.target.value })
                  }
                  rows={2}
                  className="text-sm resize-none"
                />
                <Button
                  type="submit"
                  disabled={addSaving}
                  className="w-full font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                >
                  {addSaving ? "Adding…" : "Add property"}
                </Button>
              </form>
            </div>
        )}

        {/* property list */}
        <div className="space-y-2">
            {properties.length === 0 && !showAdd && (
              <div className="rounded-2xl border border-dashed backdrop-blur-xl border-border bg-background/50">
                <EmptyState
                  icon={MapPin}
                  title="No properties added yet"
                  description="Add a home address so you can request services and start a plan."
                  action={
                    <Button
                      onClick={() => setShowAdd(true)}
                      className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                    >
                      <Plus className="w-4 h-4" />
                      Add your first property
                    </Button>
                  }
                />
              </div>
            )}

            {properties.map((prop) => {
              if (editingId === prop.id) {
                return (
                  <div
                    key={prop.id}
                    className="rounded-2xl border backdrop-blur-xl border-brand-lime/30 bg-background/70"
                  >
                    <div className="p-4 space-y-3 animate-step-enter">
                      {editError && (
                        <p className="text-xs text-red-400">{editError}</p>
                      )}
                      <Input
                        placeholder="Street address"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: e.target.value,
                          })
                        }
                        required
                        className="text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="City"
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              city: e.target.value,
                            })
                          }
                          required
                          className="text-sm"
                        />
                        <Input
                          placeholder="ST"
                          maxLength={2}
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              state: e.target.value,
                            })
                          }
                          required
                          className="text-sm"
                        />
                        <Input
                          placeholder="ZIP"
                          maxLength={10}
                          value={editForm.zip}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              zip: e.target.value,
                            })
                          }
                          required
                          className="text-sm"
                        />
                      </div>
                      <Textarea
                        placeholder="Notes"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            notes: e.target.value,
                          })
                        }
                        rows={2}
                        className="text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={saveEdit}
                          disabled={editSaving}
                          className="flex-1 font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {editSaving ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={prop.id}
                  className="flex overflow-hidden relative gap-3 justify-between items-start p-4 rounded-2xl border backdrop-blur-xl transition-colors border-border bg-background/70 hover:border-brand-lime/50"
                >
                  <GlowingEffect
                    disabled={false}
                    glow
                    proximity={64}
                    spread={26}
                    borderWidth={2}
                  />

                  <div className="flex relative gap-3 items-start min-w-0">
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-lime/25 bg-brand-lime/10">
                      <MapPin className="w-4 h-4 text-brand-lime" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {prop.address}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {prop.city}, {prop.state} {prop.zip}
                      </p>
                      {prop.notes && (
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {prop.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex relative flex-shrink-0 gap-1 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(prop)}
                      aria-label="Edit property"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-full text-muted-foreground hover:text-red-500"
                      onClick={() => openDelete(prop.id)}
                      aria-label="Delete property"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </SectionPanel>

      {/* ── Appearance ── */}
      <SectionPanel title="Appearance" bodyClassName="p-5">
        <div className="flex justify-between items-center">
          <span className="flex gap-3 items-center text-sm text-muted-foreground">
            <Sun className="w-4 h-4" />
            Theme
          </span>
          <ThemeToggle />
        </div>
      </SectionPanel>

      {/* ── Sign Out ── */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="justify-between py-6 w-full text-red-500 rounded-2xl backdrop-blur-xl border-border bg-background/70 hover:bg-red-500/5 hover:text-red-500"
      >
        <span className="flex gap-3 items-center">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this property?</DialogTitle>
            <DialogDescription>
              Its address and access notes will be removed. Past jobs stay in
              your history. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="text-white bg-red-500 rounded-full hover:bg-red-500/90"
            >
              Delete property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
