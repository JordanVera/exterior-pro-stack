"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../../../lib/trpc";
import { clearToken } from "../../../../lib/auth";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      setShowAdd(false);
      setAddForm({ address: "", city: "", state: "", zip: "", notes: "" });
      fetchData();
    } catch (err: any) {
      setAddError(err.message || "Failed to add property");
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
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || "Failed to update property");
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
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete property");
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleSignOut = () => {
    clearToken();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
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
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Settings
      </h1>

      {/* ── Profile ── */}
      <Card className="shadow-none overflow-hidden">
        <CardHeader className="p-5 pb-0 flex flex-row items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">
              {firstName} {lastName}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Phone
                </span>
              </div>
              <span className="font-mono text-sm text-neutral-500">
                {phone}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Member since
                </span>
              </div>
              <span className="text-sm text-neutral-500">{createdAt}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Properties ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            My Properties
          </h2>
          {!showAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdd(true)}
              className="text-xs text-cyan-500 hover:text-cyan-400 h-7 px-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* add form */}
        {showAdd && (
          <Card className="mb-3 animate-step-enter shadow-none border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  New Property
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
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
                  className="w-full bg-cyan-500 hover:bg-cyan-400"
                >
                  {addSaving ? "Adding..." : "Add Property"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* property list */}
        <Card className="shadow-none overflow-hidden">
          <div>
            {properties.length === 0 && !showAdd && (
              <CardContent className="py-10 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                <p className="mb-3 text-sm text-neutral-500">
                  No properties added yet.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setShowAdd(true)}
                  className="text-sm text-cyan-500 hover:text-cyan-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add your first property
                </Button>
              </CardContent>
            )}

            {properties.map((prop, i) => {
              if (editingId === prop.id) {
                return (
                  <div key={prop.id}>
                    {i > 0 && <Separator />}
                    <CardContent className="p-4 space-y-3 animate-step-enter">
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
                          className="flex-1 bg-cyan-500 hover:bg-cyan-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {editSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                );
              }

              return (
                <div key={prop.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-start justify-between gap-3 px-5 py-4">
                    <div className="flex items-start min-w-0 gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-neutral-900 dark:text-white">
                          {prop.address}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {prop.city}, {prop.state} {prop.zip}
                        </div>
                        {prop.notes && (
                          <div className="mt-1 text-xs text-neutral-400">
                            {prop.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        onClick={() => startEdit(prop)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                        onClick={() => openDelete(prop.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Appearance ── */}
      <Card className="shadow-none overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Theme
              </span>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* ── Sign Out ── */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full justify-between text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-neutral-200 dark:border-neutral-800/50"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />
      </Button>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
