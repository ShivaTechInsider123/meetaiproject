import { db } from "@/db"
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { resolve } from "path";
import { agentsInsertSchema } from "../schema";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";


export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const [existingAgent] = await db.select(
            {
                meetingCount: sql<number>`5`,
                ...getTableColumns(agents)
            }
        ).from(agents).where(eq(agents.id, input.id))
        return existingAgent
    }),



    getMany: protectedProcedure
        .input(z.object({
            page: z.number().default(DEFAULT_PAGE),
            pagesize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
            search: z.string().nullish()
        })).query(async ({ input, ctx }) => {
            const { page, pagesize, search } = input
            const data = await db.select(
                {
                    meetingCount: sql<number>`6`,
                    ...getTableColumns(agents)
                }
            ).from(agents)
                .where(
                    and(
                        eq(agents.userId, ctx.auth.user.id),
                        search ? ilike(agents.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(agents.createdAt), desc(agents.id))
                .limit(pagesize)
                .offset((page - 1) * pagesize)
            // await new Promise((resolve) => setTimeout(resolve, 5000));
            // throw new Error("Some thing went wrong")



            const [total] = await db.select({
                count: count(),
            })
                .from(agents)
                .where(
                    and(
                        eq(agents.userId, ctx.auth.user.id),
                        search ? ilike(agents.name, `%${search}%`) : undefined
                    ))

            const totalPages = Math.ceil(total.count / pagesize)

            return {
                items: data,
                total: total.count,
                totalPages
            };
        }),




    create: protectedProcedure.input(agentsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdAgent] = await db.insert(agents)
                .values({
                    ...input,
                    userId: ctx.auth.user.id
                }).returning()
            return createdAgent
        })
})
