"use client"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
export function AgentsView() {
    const trpc = useTRPC()
    const { data, isLoading, isError } = useSuspenseQuery(trpc.agents.getMany.queryOptions())

    if (isLoading) {
        return (
            <LoadingState title="Loading agents" description="Please wait while we load the agents..." />
        )
    }
    if (isError) {
        return (
            <ErrorState title="Error while loading agents" description="Failed to load agents. Please try again later." />
        )
    }
    return (
        <div className="flex justify-center items-center">
            <h1>Agents View</h1>
            <p>{JSON.stringify(data, null, 2)}</p>
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