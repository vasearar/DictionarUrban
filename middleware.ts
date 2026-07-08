export { default } from "next-auth/middleware";

export const config = { matcher: ['/define', '/contul-meu/:path*', '/report', '/username', '/verifying', '/panou', '/moderator', '/admin']}
