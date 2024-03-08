import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth/auth.server";
import { commitSession, getSession } from "~/services/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const cookie = await getSession(request.headers.get("cookie"));
  const authEmail = cookie.get("auth:email");
  const authError = cookie.get(authenticator.sessionErrorKey);

  if (!authEmail) return redirect("/login");

  // Commit session to clear any `flash` error message.
  return json({ authEmail, authError } as const, {
    headers: {
      "set-cookie": await commitSession(cookie),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const currentPath = url.pathname;

  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/account",
    failureRedirect: currentPath,
  });
}

export default function Verify() {
  const { authEmail, authError } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        {/* Code Verification Form */}
        <div>
          <div>
            <div>
              <h1>Please check your inbox</h1>
              <p>Wev&apos;e sent you a magic link email.</p>
            </div>
          </div>

          <div>
            <Form method="POST" autoComplete="off">
              <div>
                <label htmlFor="code">Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="Enter code..."
                  required
                />
              </div>
              <button type="submit">
                <span>Continue</span>
              </button>
            </Form>

            {/* Request New Code. */}
            {/* Email is already in session, so no input it's required. */}
            <Form method="POST" autoComplete="off">
              <button type="submit">
                <span>Request New Code</span>
              </button>
            </Form>
          </div>
        </div>

        {/* Errors Handling. */}
        {authEmail && authError && <span>{authError?.message}</span>}

        <p>By continuing, you agree to our </p>
      </div>
    </div>
  );
}
