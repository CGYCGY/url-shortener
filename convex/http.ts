import { httpRouter } from "convex/server";
import { authKit } from "./auth";

const http = httpRouter();

// Webhook URL to register in the WorkOS dashboard:
//   POST https://cautious-jay-60.convex.site/workos/webhook
// Signature is validated using WORKOS_WEBHOOK_SECRET set on the Convex deployment.
authKit.registerRoutes(http);

export default http;
