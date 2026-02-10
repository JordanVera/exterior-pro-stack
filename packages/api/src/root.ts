import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { serviceRouter } from "./routers/service";
import { propertyRouter } from "./routers/property";
import { quoteRouter } from "./routers/quote";
import { jobRouter } from "./routers/job";
import { providerRouter } from "./routers/provider";
import { crewRouter } from "./routers/crew";
import { notificationRouter } from "./routers/notification";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  auth: authRouter,
  service: serviceRouter,
  property: propertyRouter,
  quote: quoteRouter,
  job: jobRouter,
  provider: providerRouter,
  crew: crewRouter,
  notification: notificationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
