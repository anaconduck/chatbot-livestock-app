import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal routes bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const roleCookie =
    request.cookies.get("tanyapeternakan_role")?.value ||
    request.cookies.get("tanyaternak_role")?.value ||
    request.cookies.get("chickyai_role")?.value;

  // 1. ADMIN ROUTES PROTECTION (/admin/* except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!roleCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (roleCookie !== "ADMIN") {
      // Regular user trying to access admin dashboard -> redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 2. AUTHENTICATED USER ROUTES (/dashboard, /chat, /profile)
  const isProtectedUserRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/profile");

  if (isProtectedUserRoute) {
    if (!roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
    "/profile/:path*",
  ],
};
