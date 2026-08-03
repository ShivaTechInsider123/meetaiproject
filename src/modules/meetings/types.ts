import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type MeetingOne = inferRouterOutputs<AppRouter>['meetings']['getOne'];
export type MeetingsMany = inferRouterOutputs<AppRouter>['meetings']['getMany']['items']