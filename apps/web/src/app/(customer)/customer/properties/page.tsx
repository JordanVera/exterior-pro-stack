'use client';

import { useEffect, useState } from 'react';
import { trpc } from '../../../../lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');

  const fetchProperties = () => {
    trpc.property.list
      .query()
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await trpc.property.create.mutate({
        address,
        city,
        state: state.toUpperCase(),
        zip,
        notes: notes || undefined,
      });
      setShowForm(false);
      setAddress('');
      setCity('');
      setState('');
      setZip('');
      setNotes('');
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to add property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await trpc.property.delete.mutate({ id });
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            My Properties
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage properties for service requests
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {showForm ? 'Cancel' : '+ Add Property'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    placeholder="TX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    maxLength={10}
                    placeholder="75001"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Gate code, special instructions, etc."
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? 'Adding...' : 'Add Property'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <div className="font-medium text-foreground">
                  {property.address}
                </div>
                <div className="text-sm text-muted-foreground">
                  {property.city}, {property.state} {property.zip}
                </div>
                {property.notes && (
                  <div className="text-sm text-muted-foreground/80 mt-1">
                    {property.notes}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(property.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}

        {properties.length === 0 && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No properties added yet.</p>
            <Button
              variant="link"
              onClick={() => setShowForm(true)}
              className="mt-2 text-cyan-600 dark:text-cyan-400"
            >
              Add your first property
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
