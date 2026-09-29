"use client"

import { authClient } from "@/lib/auth-client"
import { LoaderIcon } from "lucide-react"
import { CallConnect } from "./call-connect"
import { generatedAvatarUri } from "@/lib/avatar"




interface props {
    meetingId: string
    meetingName: string
}

export function CallProvider({ meetingId, meetingName }: props) {

    const { data, isPending } = authClient.useSession()
    console.log(data)

    if (isPending || !data) {
        return (
            <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white" />
                {meetingName}
            </div>
        )
    }

    return (
        <CallConnect
            meetingId={meetingId}
            meetingName={meetingName}
            userId={data.user.id}
            userName={data.user.name}
            userImage={data.user.image ?? generatedAvatarUri({ seed: data.user.name, variant: "initials" })}
        />
    )




}