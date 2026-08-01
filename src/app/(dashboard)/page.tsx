import { auth } from "@/lib/auth";
import { HomeView } from "@/modules/Home/ui/views/home-view";
import { redirect } from "next/navigation";

import { headers } from "next/headers";
import { getQueryClient, trpc } from "@/trpc/server";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { AgentsView, AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { ErrorBoundary } from "react-error-boundary";

import { loadSearchParams } from "@/modules/agents/params";
import type { SearchParams } from "nuqs";

interface Props {
  searchParams: Promise<SearchParams>
}
export default async function Home({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams)
  const session = auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
    ...filters
  }))
  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>

          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>

      </HydrationBoundary>
    </>

  );
};