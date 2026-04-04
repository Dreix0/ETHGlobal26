import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
const isAuth = request.cookies.get("auth");

if (!isAuth && request.nextUrl.pathname !== "/") {
return NextResponse.redirect(new URL("/", request.url));
}

// if (isAuth && request.nextUrl.pathname === "/login") {
// return NextResponse.redirect(new URL("/", request.url));
// }

return NextResponse.next();
}
