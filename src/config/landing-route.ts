const landingHost = "www.evchargeops.com.br";
const apexHost = "evchargeops.com.br";

export type LandingTarget = { redirect: string } | { rewrite: string } | null;

export function landingTarget(url: URL): LandingTarget {
  if (url.hostname === apexHost) {
    return { redirect: `https://${landingHost}${url.pathname}${url.search}` };
  }
  if (url.hostname !== landingHost) return null;
  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  return { rewrite: new URL(`/landing${path}`, url).toString() };
}
