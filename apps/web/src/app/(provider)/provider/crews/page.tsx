'use client';

import { useEffect, useState } from 'react';
import { trpc } from '../../../../lib/trpc';

export default function CrewsPage() {
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCrewName, setNewCrewName] = useState('');
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [addingMemberCrewId, setAddingMemberCrewId] = useState<string | null>(
    null,
  );
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRole, setMemberRole] = useState('');

  const fetchCrews = () => {
    trpc.crew.list
      .query()
      .then(setCrews)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrews();
  }, []);

  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName) return;
    try {
      await trpc.crew.create.mutate({ name: newCrewName });
      setNewCrewName('');
      setShowCrewForm(false);
      fetchCrews();
    } catch (err: any) {
      alert(err.message || 'Failed to create crew');
    }
  };

  const handleDeleteCrew = async (id: string) => {
    if (!confirm('Delete this crew and all its members?')) return;
    try {
      await trpc.crew.delete.mutate({ id });
      fetchCrews();
    } catch (err: any) {
      alert(err.message || 'Failed to delete crew');
    }
  };

  const handleAddMember = async (crewId: string) => {
    if (!memberName) return;
    const email = memberEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      alert('Enter an email so they can log in on the app');
      return;
    }
    const digits = memberPhone.replace(/\D/g, '').slice(-10);
    try {
      await trpc.crew.addMember.mutate({
        crewId,
        name: memberName,
        email,
        phone: digits.length === 10 ? `+1${digits}` : undefined,
        role: memberRole || undefined,
      });
      setAddingMemberCrewId(null);
      setMemberName('');
      setMemberEmail('');
      setMemberPhone('');
      setMemberRole('');
      fetchCrews();
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await trpc.crew.removeMember.mutate({ id });
      fetchCrews();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const inputClass =
    'block w-full px-3 py-2 text-sm border border-border dark:border-neutral-700 rounded bg-card dark:bg-neutral-950 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-neutral-400">
        Loading crews...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crews
          </h2>
          <p className="mt-1 text-gray-500 dark:text-neutral-400">
            Manage your crews and team members
          </p>
        </div>
        <button
          onClick={() => setShowCrewForm(!showCrewForm)}
          className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
        >
          {showCrewForm ? 'Cancel' : '+ New Crew'}
        </button>
      </div>

      {showCrewForm && (
        <form onSubmit={handleCreateCrew} className="flex gap-3">
          <input
            type="text"
            value={newCrewName}
            onChange={(e) => setNewCrewName(e.target.value)}
            placeholder="Crew name (e.g., Team Alpha)"
            className="flex-1 px-4 py-2 text-gray-900 rounded-lg border outline-none bg-card border-border dark:text-white dark:bg-neutral-950 dark:border-neutral-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
          >
            Create
          </button>
        </form>
      )}

      <div className="space-y-4">
        {crews.map((crew) => (
          <div
            key={crew.id}
            className="p-5 rounded-xl border bg-card border-border dark:bg-neutral-900 dark:border-neutral-800"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {crew.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setAddingMemberCrewId(
                      addingMemberCrewId === crew.id ? null : crew.id,
                    )
                  }
                  className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  + Add Member
                </button>
                <button
                  onClick={() => handleDeleteCrew(crew.id)}
                  className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Delete Crew
                </button>
              </div>
            </div>

            {crew.members.length > 0 ? (
              <div className="space-y-2">
                {crew.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/70 dark:bg-neutral-950"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </span>
                      {member.role && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-neutral-400">
                          ({member.role})
                        </span>
                      )}
                      {member.email && (
                        <span className="ml-2 text-sm text-gray-400 dark:text-neutral-500">
                          {member.email}
                        </span>
                      )}
                      {member.phone && (
                        <span className="ml-2 text-sm text-gray-400 dark:text-neutral-500">
                          {member.phone}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-neutral-500">
                No members yet
              </p>
            )}

            {addingMemberCrewId === crew.id && (
              <div className="p-3 mt-3 space-y-2 rounded-lg bg-muted/70 dark:bg-neutral-950">
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Name *"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Email * (they log in with this)"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) =>
                      setMemberPhone(
                        e.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                    placeholder="Phone (optional)"
                    className={`flex-1 ${inputClass}`}
                  />
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="Role (e.g., Lead)"
                    className={`flex-1 ${inputClass}`}
                  />
                </div>
                <button
                  onClick={() => handleAddMember(crew.id)}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}

        {crews.length === 0 && !showCrewForm && (
          <div className="py-12 text-center text-gray-500 dark:text-neutral-400">
            <p>No crews yet.</p>
            <button
              onClick={() => setShowCrewForm(true)}
              className="mt-2 font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              Create your first crew
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
