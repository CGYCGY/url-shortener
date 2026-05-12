/**
 * Creates a WorkOS user. Self-service signup is disabled in the WorkOS dashboard,
 * so this CLI is the only way to provision accounts for this app.
 *
 * Usage:
 *   bun run seed-user -- --email alice@example.com --password 'secret' \
 *     [--first-name Alice] [--last-name Smith]
 *
 * Requires WORKOS_API_KEY in the environment.
 */
import { parseArgs } from "node:util";
import { WorkOS } from "@workos-inc/node";

type ParsedArgs = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

function parseCliArgs(): ParsedArgs {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      email: { type: "string" },
      password: { type: "string" },
      "first-name": { type: "string" },
      "last-name": { type: "string" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (!values.email) {
    throw new Error("--email is required");
  }
  if (!values.password) {
    throw new Error("--password is required");
  }

  return {
    email: values.email,
    password: values.password,
    firstName: values["first-name"],
    lastName: values["last-name"],
  };
}

async function main() {
  const args = parseCliArgs();

  const apiKey = process.env.WORKOS_API_KEY;
  if (!apiKey) {
    throw new Error("WORKOS_API_KEY is not set in the environment");
  }

  const workos = new WorkOS(apiKey);
  const user = await workos.userManagement.createUser({
    email: args.email,
    password: args.password,
    firstName: args.firstName,
    lastName: args.lastName,
    emailVerified: true,
  });

  console.log(`Created WorkOS user ${user.id} (${user.email}).`);
}

main().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(`Error: ${err.message}`);
  } else {
    console.error("Error:", err);
  }
  process.exit(1);
});
