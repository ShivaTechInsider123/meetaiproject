
import { AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function Meetings() {
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}))
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div className="text-white"><AgentsViewLoading /></div>}>
                <ErrorBoundary fallback={<AgentsViewError />}>
                    <MeetingsView />
                </ErrorBoundary>
            </Suspense>

        </HydrationBoundary>




    )
}