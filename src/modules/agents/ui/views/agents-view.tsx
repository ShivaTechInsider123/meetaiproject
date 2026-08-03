"use client"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/data-table"
import { columns } from "../components/columns"
import { EmptyState } from "@/components/empty-state"
import { useAgentFilters } from "../../hooks/use-agents-filters"
import { DataPagination } from "../components/data-pagination"
import { useRouter } from "next/navigation"



export function AgentsView() {
    const router = useRouter()
    const [filters, setFilters] = useAgentFilters()
    const trpc = useTRPC()
    const { data, isLoading, isError } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }))

    // if (isLoading) {
    //     return (
    //         <LoadingState title="Loading agents" description="Please wait while we load the agents..." />
    //     )
    // }
    // if (isError) {
    //     return (
    //         <ErrorState title="Error while loading agents" description="Failed to load agents. Please try again later." />
    //     )
    // }
    return (

        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data.items} columns={columns} onRowClick={(row) => router.push(`/agents/${row.id}`)} />
            <DataPagination page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            {data.items.length === 0 && (
                <EmptyState title="Create your first agent"
                    description="Create an agent to join your meetings Each agent will follow your instructions 
                    and can interact with participants during the call."/>
            )
            }
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