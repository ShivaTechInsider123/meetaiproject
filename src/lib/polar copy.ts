import { createPolar } from "@polar-sh/sdk/2026-10";

export const polarProcedureClient = createPolar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    environment: "sandbox",
});