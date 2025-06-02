import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);
const isCourseViewingRoute = createRouteMatcher(["/user/courses/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const userRole = (sessionClaims?.metadata as { userType: "student" | "teacher" })?.userType || "student";

  console.log("Middleware - Path:", req.nextUrl.pathname, "Role:", userRole, "User ID:", userId);

  // Allow access to the dashboard redirect page for authenticated users
  if (req.nextUrl.pathname === "/dashboard-redirect") {
    // No redirect needed, let the page handle it
    console.log("Middleware - Allowing access to dashboard-redirect");
    return NextResponse.next();
  }

  // If the user is authenticated
  if (userId) {
    // Allow teachers to access the course viewing routes under /user/courses/
    if (userRole === "teacher" && isCourseViewingRoute(req)) {
      console.log("Middleware - Teacher accessing course viewing route, allowing access.");
      return NextResponse.next();
    }

    // Restrict student-only routes to students
    if (isStudentRoute(req) && userRole !== "student") {
      console.log("Middleware - Non-student accessing student route, redirecting to /teacher/courses");
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }

    // Restrict teacher-only routes to teachers
    if (isTeacherRoute(req) && userRole !== "teacher") {
      console.log("Middleware - Non-teacher accessing teacher route, redirecting to /user/courses");
      const url = new URL("/user/courses", req.url);
      // Note: Redirecting teachers to /user/courses is likely incorrect based on app structure,
      // might need adjustment based on actual student dashboard route.
      // Assuming /user/courses is the student dashboard or similar.
      return NextResponse.redirect(url);
    }
  }

  // If the user is not authenticated, Clerk will handle protection based on configuration
  console.log("Middleware - User not authenticated or route not matched, proceeding.");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
