
import { UpgradeView, UpgradeViewError, UpgradeViewLoading } from "@/modules/premium/ui/views/upgrade-view"
import { getQueryClient, trpc } from "@/trpc/server"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"


export default async function Page() {

    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.premium.getProducts.queryOptions())
    // void queryClient.prefetchQuery(trpc.premium.getCurr)
    return (
        <HydrationBoundary
            state={dehydrate(queryClient)}
        >
            <Suspense fallback={<UpgradeViewLoading />}>
                <ErrorBoundary fallback={<UpgradeViewError />}>
                    <UpgradeView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}