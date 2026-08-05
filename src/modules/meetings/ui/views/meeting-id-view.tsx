"use client"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { MeetingIdViewHeader } from "../components/meeting-id-view-header"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/hooks/use-confirm"
import { UpdateAgentDialog } from "@/modules/agents/ui/components/update-agent-dialog"
import { UpdateMeetingDialog } from "../components/update-meeting-dialog"
import { useState } from "react"

interface Props {
    meetingId: string
}

export function MeetingIdView({ meetingId }: Props) {
    const trpc = useTRPC()
    const router = useRouter()
    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false)
    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?", "This following action will remove this meeting"
    )
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }))

    const queryClient = useQueryClient()

    const removeMeetings = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                router.push("/meetings")
            },
            onError: () => { }

        })
    )

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove()

        if (!ok) {
            return
        }
        await removeMeetings.mutateAsync({ id: meetingId })
    }
    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data} />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                {JSON.stringify(data, null, 2)}
            </div>
        </>
    )
}


export function MeetingIdViewLoading() {
    return (
        <LoadingState title="Loading meeting" description="Please wait while we load the meeting..." />
    )
}

export function MeetingIdViewError() {
    return (
        <ErrorState title="Error while loading meeting" description="Failed to load meeting. Please try again later." />
    )
}