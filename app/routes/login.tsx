import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth/auth.server";
import { commitSession, getSession } from "~/services/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const cookie = await getSession(request.headers.get("cookie"));
  const authEmail = cookie.get("auth:email");
  const authError = cookie.get(authenticator.sessionErrorKey);

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
    successRedirect: "/verify",
    failureRedirect: currentPath,
  });
}

export default function Login() {
  const { authEmail, authError } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <div>
          <div>
            <div>
              <h1>Welcome back</h1>
              <p>Log in or sign in to your account</p>
            </div>
          </div>

          <Form method="POST" autoComplete="off">
            <div>
              <label htmlFor="email">Email: </label>
              <input
                type="email"
                name="email"
                defaultValue={authEmail ? authEmail : "gnasamx@gmail.com"}
                placeholder="name@example.com"
                autoComplete="false"
                required
              />
            </div>
            <br />
            <button type="submit">
              <span>Continue with Email</span>
            </button>
          </Form>
        </div>

        {/* Errors Handling. */}
        {!authEmail && authError && <span>{authError.message}</span>}

        <p>By continuing, you agree to our </p>
      </div>
    </div>
  );
}
