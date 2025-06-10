import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl;

  // Only guard /admin routes
  if (url.pathname.startsWith("/admin")) {
    try {
      console.log("Middleware: Checking admin route access");
      if (!token) {
        console.log("Middleware: No token found");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      console.log("Middleware: Verifying token");
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log("Middleware: Token decoded successfully", payload);

      if (payload.role !== "admin") {
        console.log("Middleware: User is not admin");
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch (err) {
      console.error("Middleware error:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
