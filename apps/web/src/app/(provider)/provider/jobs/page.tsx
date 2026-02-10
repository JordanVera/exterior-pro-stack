"use client";

import { useEffect, useState } from "react";
import { trpc } from "../../../../lib/trpc";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  // Scheduling state
  const [schedulingJobId, setSchedulingJobId] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");

  // Assignment state
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState("");

  const fetchData = () => {
    const params = filter ? { status: filter as any } : undefined;
    Promise.all([trpc.job.listForProvider.query(params), trpc.crew.list.query()])
      .then(([j, c]) => {
        setJobs(j);
        setCrews(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [filter]);

  const handleSchedule = async (quoteId: string) => {
    if (!schedDate || !schedTime) return;
    try {
      await trpc.job.schedule.mutate({
        quoteId,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
      });
      setSchedulingJobId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to schedule");
    }
  };

  const handleAssignCrew = async (jobId: string) => {
    if (!selectedCrewId) return;
    try {
      await trpc.job.assignCrew.mutate({ jobId, crewId: selectedCrewId });
      setAssigningJobId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to assign crew");
    }
  };

  const handleStatusUpdate = async (
    jobId: string,
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) => {
    try {
      await trpc.job.updateStatus.mutate({ jobId, status });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
        <p className="text-gray-500 mt-1">
          Schedule, assign crews, and manage jobs
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filter === status
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status ? status.replace("_", " ") : "All"}
            </button>
          )
        )}
      </div>

      {/* Jobs */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {job.quote.service.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[job.status]
                    }`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {job.quote.property.address}, {job.quote.property.city}
                </p>
                {job.quote.customPrice && (
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    Price: ${Number(job.quote.customPrice).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="text-right text-sm text-gray-500">
                {job.scheduledDate && (
                  <div>
                    {new Date(job.scheduledDate).toLocaleDateString()}
                    {job.scheduledTime && ` at ${job.scheduledTime}`}
                  </div>
                )}
                {job.assignments.length > 0 && (
                  <div className="text-gray-400">
                    {job.assignments.map((a: any) => a.crew.name).join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {job.status === "PENDING" && (
                <>
                  {schedulingJobId === job.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="time"
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => handleSchedule(job.quote.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSchedulingJobId(null)}
                        className="px-3 py-1 text-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSchedulingJobId(job.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Schedule
                    </button>
                  )}
                </>
              )}

              {["PENDING", "SCHEDULED"].includes(job.status) && crews.length > 0 && (
                <>
                  {assigningJobId === job.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCrewId}
                        onChange={(e) => setSelectedCrewId(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="">Select crew...</option>
                        {crews.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.members.length} members)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignCrew(job.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setAssigningJobId(null)}
                        className="px-3 py-1 text-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningJobId(job.id)}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100"
                    >
                      Assign Crew
                    </button>
                  )}
                </>
              )}

              {job.status === "SCHEDULED" && (
                <button
                  onClick={() => handleStatusUpdate(job.id, "IN_PROGRESS")}
                  className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg border border-yellow-200 hover:bg-yellow-100"
                >
                  Start Job
                </button>
              )}

              {job.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleStatusUpdate(job.id, "COMPLETED")}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  Complete Job
                </button>
              )}

              {["PENDING", "SCHEDULED"].includes(job.status) && (
                <button
                  onClick={() => handleStatusUpdate(job.id, "CANCELLED")}
                  className="px-3 py-1.5 text-red-600 text-sm rounded-lg border border-red-200 hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No jobs yet. Jobs are created when customers accept your quotes.
          </div>
        )}
      </div>
    </div>
  );
}
