import { NextRequest, NextResponse } from "next/server";
import {
  expireStaleBids,
  generateSubscriptionJobs,
  sendUpcomingJobReminders,
} from "@repo/api";

function authorize(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await generateSubscriptionJobs();
  const bids = await expireStaleBids();
  const reminders = await sendUpcomingJobReminders();

  return NextResponse.json({ ok: true, jobs, bids, reminders });
}
