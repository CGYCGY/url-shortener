import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    WORKOS_CLIENT_ID: z.string().min(1).optional(),
    WORKOS_API_KEY: z.string().min(1).optional(),
    WORKOS_COOKIE_PASSWORD: z.string().min(32).optional(),
    WORKOS_WEBHOOK_SECRET: z.string().min(1).optional(),
    CONVEX_DEPLOYMENT: z.string().min(1).optional(),
    LINK_UNLOCK_COOKIE_SECRET: z.string().min(32).optional(),
  },
  client: {
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: z.string().url().optional(),
    NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
    WORKOS_WEBHOOK_SECRET: process.env.WORKOS_WEBHOOK_SECRET,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    LINK_UNLOCK_COOKIE_SECRET: process.env.LINK_UNLOCK_COOKIE_SECRET,
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
