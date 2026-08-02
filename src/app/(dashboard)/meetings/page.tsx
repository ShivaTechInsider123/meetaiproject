
import { auth } from "@/lib/auth";
import { AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function Meetings() {

    const session = auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect("/sign-in")
    }

    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}))
    return (
        <>
            <MeetingsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<div className="text-white"><AgentsViewLoading /></div>}>
                    <ErrorBoundary fallback={<AgentsViewError />}>
                        <MeetingsView />
                    </ErrorBoundary>
                </Suspense>

            </HydrationBoundary>

        </>


    )
}