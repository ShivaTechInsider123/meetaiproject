"use client"

import { DataTable } from "@/components/data-table"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { columns } from "../components/columns"
import { EmptyState } from "@/components/empty-state"
import { useMeetingsFilters } from "../../hooks/use-agents-filters"
import { DataPagination } from "@/modules/agents/ui/components/data-pagination"

export function MeetingsView() {
    const [filters, setFilters] = useMeetingsFilters()
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filters
    }))
    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data.items} columns={columns} />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })} />
            {data.items.length === 0 && (
                <EmptyState title="Create your first meeting"
                    description="Schedule a meeting to connect with others.
                     Each meeting lets you collaborate, share ideas, and iteract with participants in real time." />
            )
            }
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