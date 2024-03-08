import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/account",
    failureRedirect: "/login",
  });
}
