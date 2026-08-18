import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@repo/api";

type Outputs = inferRouterOutputs<AppRouter>;

export type Me = Outputs["auth"]["me"];
export type FieldJob = Outputs["job"]["getById"];
export type FieldJobListItem = Outputs["job"]["listMine"][number];
export type CrewList = Outputs["crew"]["list"];
