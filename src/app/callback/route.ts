import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
  returnPathname: "/dashboard",
  onError: async ({ error, request }) => {
    console.error("WorkOS callback error", error);
    return Response.redirect(new URL("/login?error=callback", request.url), 302);
  },
});
