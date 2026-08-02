import { db } from "@/db"
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { resolve } from "path";
import { agentsInsertSchema, agentsUpdateSchema } from "../schema";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";


export const agentsRouter = createTRPCRouter({
    update: protectedProcedure.input(agentsUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const [updatedAgent] = await db
                .update(agents)
                .set(input)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.auth.user.id)
                    )
                )
                .returning()

            if (!updatedAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found"
                })
            }
            return updatedAgent

        }),


    remove: protectedProcedure.input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const [removeAgent] = await db
                .delete(agents)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.auth.user.id)
                    ),
                )
                .returning();
            if (!removeAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent Not Found"
                })
            }
            return removeAgent;
        }),




    getOne: protectedProcedure.input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {

            const [existingAgent] = await db.select(
                {
                    meetingCount: sql<number>`5`,
                    ...getTableColumns(agents)
                }
            ).from(agents)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.auth.user.id)
                    )
                )
            if (!existingAgent) {
                throw new TRPCError(({ code: "NOT_FOUND", message: "Agent not found" }))
            }
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
