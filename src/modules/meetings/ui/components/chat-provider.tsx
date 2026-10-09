"use client"

import { LoadingState } from "@/components/loading-state"
import { authClient } from "@/lib/auth-client"
import { ChatUI } from "./chat-ui"


interface Props {
    meetingId: string,
    meetingName: string
}

export const ChatProvider = ({ meetingId, meetingName }: Props) => {
    const { data, isPending } = authClient.useSession()
    if (isPending || !data?.user) {
        return (
            <LoadingState
                title="loading chat"
                description="Please wait while we load the chat"
            />
        )
    }

    return (
        <ChatUI
            meetingId={meetingId}
            meetingName={meetingName}
            userId={data.user.id}
            userName={data.user.name ?? "User"}
            userImage={data.user.image ?? ""}

        />


    )

}