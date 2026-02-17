import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { serviceRouter } from "./routers/service";
import { propertyRouter } from "./routers/property";
import { jobRouter } from "./routers/job";
import { bidRouter } from "./routers/bid";
import { providerRouter } from "./routers/provider";
import { crewRouter } from "./routers/crew";
import { notificationRouter } from "./routers/notification";
import { adminRouter } from "./routers/admin";
import { subscriptionRouter } from "./routers/subscription";

export const appRouter = router({
  auth: authRouter,
  service: serviceRouter,
  property: propertyRouter,
  job: jobRouter,
  bid: bidRouter,
  provider: providerRouter,
  crew: crewRouter,
  notification: notificationRouter,
  admin: adminRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
