import { next, rewrite } from "@vercel/functions";

import { landingTarget } from "./src/config/landing-route.ts";

export const config = {
  matcher: "/((?!landing/).*)",
};

export default function middleware(request: Request) {
  const target = landingTarget(new URL(request.url));
  if (!target) return next();
  if ("redirect" in target) return Response.redirect(target.redirect, 308);
  return rewrite(target.rewrite);
}
