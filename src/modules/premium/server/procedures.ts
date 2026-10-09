import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { polarProcedureClient } from "@/lib/polar copy";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { count, eq } from "drizzle-orm";



export const premiumRouter = createTRPCRouter({

    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        const customer = await polarProcedureClient.customers.getStateExternal(
            ctx.auth.user.id
        )
        const subscription = customer.active_subscriptions[0]

        if (!subscription) {
            return null
        }

        const product = await polarProcedureClient.products.get(subscription.product_id)
        return product
    }),


    getProducts: protectedProcedure.query(async () => {
        const products = await polarProcedureClient.products.list({
            is_archived: false,
            is_recurring: true,
            sorting: ["-price_amount"]
        })

        return products.items

    }),



    getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
        const customer = await polarProcedureClient.customers.getStateExternal(
            ctx.auth.user.id
        )
        const subscription = customer.active_subscriptions[0]

        if (subscription) {
            return null
        }

        const [userMeetings] = await db
            .select({
                count: count(meetings.id),
            })
            .from(meetings)
            .where(eq(meetings.userId, ctx.auth.user.id));

        const [userAgents] = await db
            .select({
                count: count(agents.id)
            })
            .from(agents)
            .where(eq(agents.userId, ctx.auth.user.id))


        return {
            meetingCount: userMeetings.count,
            agentCount: userAgents.count
        }

    })
})

