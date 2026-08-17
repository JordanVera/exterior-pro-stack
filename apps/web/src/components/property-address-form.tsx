'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export type CreatedProperty = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes?: string | null;
};

interface PropertyAddressFormProps {
  submitLabel?: string;
  onSuccess?: (property: CreatedProperty) => void;
}

export function PropertyAddressForm({
  submitLabel = 'Add property',
  onSuccess,
}: PropertyAddressFormProps) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const property = await trpc.property.create.mutate({
        address,
        city,
        state: state.toUpperCase(),
        zip,
        notes: notes || undefined,
      });
      toast.success('Property added');
      onSuccess?.(property);
    } catch (err: any) {
      const msg = err.message || 'Failed to add property';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <Input
        placeholder="Street address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        className="text-sm"
      />
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="text-sm"
        />
        <Input
          placeholder="ST"
          maxLength={2}
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          className="text-sm"
        />
        <Input
          placeholder="ZIP"
          maxLength={10}
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          required
          className="text-sm"
        />
      </div>
      <Textarea
        placeholder="Notes (gate code, access instructions...)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="resize-none text-sm"
      />
      <Button
        type="submit"
        disabled={saving || !address || !city || !state || !zip}
        className="w-full rounded-xl bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
      >
        {saving ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
