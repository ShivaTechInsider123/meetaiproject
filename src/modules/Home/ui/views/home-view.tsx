"use client"
import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";

export function HomeView() {
    const { data: session } = authClient.useSession()
    const router = useRouter()
    if (!session) {
        return
        <p>Loading...</p>
    }
    return (
        <div className="flex flex-col gap-6">
            <h1>Welcome, {session.user?.name}</h1>

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