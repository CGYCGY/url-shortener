import { query } from "./_generated/server";
import { authKit } from "./auth";

export const whoami = query({
  args: {},
  handler: async (ctx) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) return null;
    return { id: user.id, email: user.email };
  },
});
