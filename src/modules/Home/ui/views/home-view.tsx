"use client"
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { redirect, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function HomeView() {
    const trpc = useTRPC()
    const { data: session } = authClient.useSession()
    const { data } = useQuery(trpc.agents.getMany.queryOptions())
    const router = useRouter()
    if (!session) {
        return
        <p>Loading...</p>
    }
    return (
        <div className="flex flex-col gap-6">
            <h1>Welcome, {session.user?.name}</h1>
            <h1>{data?.map((a) => a.name)}</h1>

            <button onClick={() => authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in")
                    }
                }
            })}>Sign out</button>
        </div>
    )
}