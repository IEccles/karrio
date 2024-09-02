import { MULTI_TENANT } from "@karrio/lib/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { IMAGES } from "@karrio/types";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname, search, href } = req.nextUrl;
  const hostname = req.headers.get("host") as string;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-search", search);
  requestHeaders.set("x-href", href);

  if (pathname.startsWith("/carriers")) {
    const unknown = IMAGES.filter((k) => req.url.includes(k)).length === 0;
    if (unknown) {
      const name = req.url.split("/carriers/").pop();
      return NextResponse.rewrite(new URL(`/api/images/${name}`, req.url));
    }
    return;
  }

  if (MULTI_TENANT === false) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${pathname}`, req.url));
}