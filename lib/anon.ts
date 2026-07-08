// Conturile anonime au email generat de providerul "anonym" din
// app/confings/auth.ts (anon_xxx@no-reply.localhost). Regex-ul e sursa unică
// de adevăr pentru „e cont anonim?" — folosit și în UI, și server-side.
export const anonEmailRx = /^anon_[a-z0-9]+@no-reply\.localhost$/i;

export const isAnonEmail = (email?: string | null): boolean =>
  !!email && anonEmailRx.test(email);
