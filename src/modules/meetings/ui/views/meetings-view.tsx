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
            Todo data filters
        </div>
    )
}


export function MeetingsViewLoading() {
    return (
        <LoadingState title="Loading meetings" description="Please wait while we load the meetings..." />
    )
}

export function MeetingsViewError() {
    return (
        <ErrorState title="Error while loading meetings" description="Failed to load meetings. Please try again later." />
    )
}