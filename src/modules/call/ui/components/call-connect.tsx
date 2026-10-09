"use client"

import { useTRPC } from "@/trpc/client"
import { Call, CallingState, StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { useMutation } from "@tanstack/react-query"
import { LoaderIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { CallUI } from "./call-ui"

interface props {
    meetingId: string,
    meetingName: string,
    userId: string,
    userName: string,
    userImage: string
}

export function CallConnect({ meetingId, meetingName, userId, userName, userImage }: props) {

    const trpc = useTRPC()

    const [client, setClient] = useState<StreamVideoClient>()
    const { mutateAsync: generateToken } = useMutation(
        trpc.meetings.generateToken.mutationOptions()
    )

    useEffect(() => {
        const _client = StreamVideoClient.getOrCreateInstance({
            apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage
            },
            tokenProvider: generateToken,
        }
        )

        setClient(_client)

        return () => {
            // _client.disconnectUser()
            setClient(undefined)
        }
    }, [userId, userName, userImage])


    const [call, setCall] = useState<Call>();

    useEffect(() => {
        if (!client) {
            return
        }

        const _call = client.call("default", meetingId)
        _call.camera.disable()
        _call.microphone.disable()
        setCall(_call)


        return () => {
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave()
                _call.endCall()
                setCall(undefined)
            }
        }
    }, [client, meetingId])


    if (!client || !call) {
        return (
            <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white" />
                {meetingName}
            </div>
        )
    }
    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>

                <CallUI meetingName={meetingName} />
            </StreamCall>

        </StreamVideo>
    )
}

