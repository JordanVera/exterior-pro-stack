'use client';

import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';

export type ProviderCrew = {
  id: string;
  name: string;
  members: { id: string; name: string; role?: string | null }[];
};

export function CrewSummary({ crews }: { crews: ProviderCrew[] }) {
  return (
    <SectionPanel
      title="Crews"
      count={crews.length}
      viewAll={{ href: '/provider/crews', label: 'Manage' }}
      bodyClassName={crews.length === 0 ? 'p-0' : 'p-3'}
    >
      {crews.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No crews yet"
          description="Add a crew so you can assign field work and track it in the app."
          action={
            <Button
              asChild
              size="sm"
              className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
            >
              <Link href="/provider/crews">
                <Plus className="w-4 h-4" />
                Add a crew
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-1">
          {crews.slice(0, 4).map((crew) => (
            <li key={crew.id}>
              <Link
                href="/provider/crews"
                className="flex gap-3 items-center p-2 rounded-xl transition-colors group hover:bg-muted/50"
              >
                <span className="flex justify-center items-center w-8 h-8 text-xs font-bold rounded-lg border shrink-0 border-brand-lime/25 bg-brand-lime/10 text-brand-lime">
                  {crew.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate text-foreground">
                    {crew.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {crew.members.length} member
                    {crew.members.length === 1 ? '' : 's'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
