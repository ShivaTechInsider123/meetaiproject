import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";


export type AgentGetMany = inferRouterOutputs<AppRouter>['agents']['getMany']['items'];
export type AgentOne = inferRouterOutputs<AppRouter>['agents']['getOne'];