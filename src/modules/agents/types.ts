import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type AgentOne = inferRouterOutputs<AppRouter>['agents']['getOne'];