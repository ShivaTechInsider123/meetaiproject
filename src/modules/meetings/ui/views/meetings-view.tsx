"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function MeetingsView() {

    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))
    return (
        <div>
            Meetings View
            {JSON.stringify(data, null, 2)}
        </div>
    )
}


export function AgentsViewLoading() {
    return (
        <LoadingState title="Loading agents" description="Please wait while we load the agents..." />
    )
}

export function AgentsViewError() {
    return (
        <ErrorState title="Error while loading agents" description="Failed to load agents. Please try again later." />
    )
}