"use client"
import { EmptyState } from "@/components/empty-state"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CallProvider } from "../components/call-provider"
interface props {
    meetingId: string
}

export function CallView({
    meetingId
}: props) {

    const trpc = useTRPC()
    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    )

    if (data.status === "completed") {
        return (
            <EmptyState
                title="Meeting ended"
                description="You can no longer join this meeting"
            />
        )
    }

    return (
        <div>
            <CallProvider meetingId={meetingId} meetingName={data.name} />
        </div>
    )
}

