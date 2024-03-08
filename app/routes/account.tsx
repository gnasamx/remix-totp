import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { authenticator } from "~/services/auth/auth.server";
import { prisma } from "~/utils/prisma";
import { destroySession, getSession } from "~/services/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return redirect("/login");

  return json({ user } as const);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return redirect("/login");

  // Delete user.
  await prisma.user.delete({ where: { id: session.id } });

  // Destroy session.
  return redirect("/", {
    headers: {
      "set-cookie": await destroySession(
        await getSession(request.headers.get("cookie"))
      ),
    },
  });
}

export default function AdminIndex() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <div>
          <span>🥳</span>

          <div>
            <h1>My account</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {/* Delete Account */}
          <Form method="POST" autoComplete="off">
            <button type="submit" name="intent">
              Remove account
            </button>
          </Form>

          {/* Log out */}
          <Form method="POST" action="/logout" autoComplete="off">
            <button type="submit">Log out</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
