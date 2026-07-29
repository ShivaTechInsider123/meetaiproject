import { db } from "@/db"
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { resolve } from "path";


export const agentsRouter = createTRPCRouter({
    getMany: baseProcedure.query(async () => {
        const data = await db.select().from(agents)
        // await new Promise((resolve) => setTimeout(resolve, 5000));
        // throw new Error("Some thing went wrong")
        return data;
    })
})
