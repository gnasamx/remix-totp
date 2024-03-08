import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { authenticator } from "./auth.server";

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_auth",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET as string],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = authSessionStorage;

export async function requireSession(request: Request) {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: `/login`,
  });

  if (!session.id) {
    throw redirect("/login");
  }
}
