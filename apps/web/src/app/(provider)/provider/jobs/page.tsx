"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
  SCHEDULED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [schedulingJobId, setSchedulingJobId] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState("");

  const fetchData = () => {
    const params = filter ? { status: filter as any } : undefined;
    Promise.all([trpc.job.listForProvider.query(params), trpc.crew.list.query()])
      .then(([j, c]) => { setJobs(j); setCrews(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchData(); }, [filter]);

  const handleSchedule = async (quoteId: string) => {
    if (!schedDate || !schedTime) return;
    try { await trpc.job.schedule.mutate({ quoteId, scheduledDate: schedDate, scheduledTime: schedTime }); setSchedulingJobId(null); fetchData(); }
    catch (err: any) { alert(err.message || "Failed to schedule"); }
  };

  const handleAssignCrew = async (jobId: string) => {
    if (!selectedCrewId) return;
    try { await trpc.job.assignCrew.mutate({ jobId, crewId: selectedCrewId }); setAssigningJobId(null); fetchData(); }
    catch (err: any) { alert(err.message || "Failed to assign crew"); }
  };

  const handleStatusUpdate = async (jobId: string, status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
    try { await trpc.job.updateStatus.mutate({ jobId, status }); fetchData(); }
    catch (err: any) { alert(err.message || "Failed to update status"); }
  };

  const inputClass = "rounded border border-gray-300 dark:border-neutral-700 px-2 py-1 text-sm bg-white dark:bg-neutral-950 text-gray-900 dark:text-white";

  if (loading) {
    return <div className="text-gray-500 dark:text-neutral-400">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Schedule, assign crews, and manage jobs</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === status
                ? "bg-green-600 text-white border-green-600"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
            }`}
          >
            {status ? status.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{job.quote.service.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>{job.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{job.quote.property.address}, {job.quote.property.city}</p>
                {job.quote.customPrice && <p className="text-sm font-medium text-gray-700 dark:text-neutral-300 mt-1">Price: ${Number(job.quote.customPrice).toFixed(2)}</p>}
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-neutral-400">
                {job.scheduledDate && <div>{new Date(job.scheduledDate).toLocaleDateString()}{job.scheduledTime && ` at ${job.scheduledTime}`}</div>}
                {job.assignments.length > 0 && <div className="text-gray-400 dark:text-neutral-500">{job.assignments.map((a: any) => a.crew.name).join(", ")}</div>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.status === "PENDING" && (
                <>
                  {schedulingJobId === job.id ? (
                    <div className="flex items-center gap-2">
                      <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} className={inputClass} />
                      <input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className={inputClass} />
                      <button onClick={() => handleSchedule(job.quote.id)} className="px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700">Confirm</button>
                      <button onClick={() => setSchedulingJobId(null)} className="px-3 py-1 text-gray-500 dark:text-neutral-400 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setSchedulingJobId(job.id)} className="px-3 py-1.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700">Schedule</button>
                  )}
                </>
              )}

              {["PENDING", "SCHEDULED"].includes(job.status) && crews.length > 0 && (
                <>
                  {assigningJobId === job.id ? (
                    <div className="flex items-center gap-2">
                      <select value={selectedCrewId} onChange={(e) => setSelectedCrewId(e.target.value)} className={inputClass}>
                        <option value="">Select crew...</option>
                        {crews.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.members.length} members)</option>))}
                      </select>
                      <button onClick={() => handleAssignCrew(job.id)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Assign</button>
                      <button onClick={() => setAssigningJobId(null)} className="px-3 py-1 text-gray-500 dark:text-neutral-400 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setAssigningJobId(job.id)} className="px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg border border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-950/50">Assign Crew</button>
                  )}
                </>
              )}

              {job.status === "SCHEDULED" && (
                <button onClick={() => handleStatusUpdate(job.id, "IN_PROGRESS")} className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-lg border border-yellow-200 dark:border-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-950/50">Start Job</button>
              )}

              {job.status === "IN_PROGRESS" && (
                <button onClick={() => handleStatusUpdate(job.id, "COMPLETED")} className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Complete Job</button>
              )}

              {["PENDING", "SCHEDULED"].includes(job.status) && (
                <button onClick={() => handleStatusUpdate(job.id, "CANCELLED")} className="px-3 py-1.5 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30">Cancel</button>
              )}
            </div>
          </div>
        ))}

        {jobs.length === 0 && <div className="text-center py-12 text-gray-500 dark:text-neutral-400">No jobs yet. Jobs are created when customers accept your quotes.</div>}
      </div>
    </div>
  );
}
