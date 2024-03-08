import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticator } from "~/services/auth/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Curve" },
    {
      name: "description",
      content: "An easy way to track time across projects",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Curve</h1>
      <div>
        <Link to="/login">
          <span>Authenticate</span>
        </Link>
      </div>
    </div>
  );
}
