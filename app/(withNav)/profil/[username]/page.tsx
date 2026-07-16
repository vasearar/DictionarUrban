import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/profile";
import ProfileHeader from "@/app/shared/ProfileHeader";
import Definition from "@/app/shared/Definition";

// Pagina de profil public: /profil/[username]

interface Props {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ page?: string; popularity?: string }>;
}

// Segmentul din URL poate avea percent-encoding malformat → tratăm ca negăsit.
async function resolveName(params: Props["params"]): Promise<string | null> {
  const { username: raw } = await params;
  try {
    return decodeURIComponent(raw).trim() || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = await resolveName(params);
  const profile = name ? await getPublicProfile(name) : null;
  if (!profile) {
    return { title: "Profil negăsit - Dicționar urban" };
  }
  return {
    title: `Profilul lui ${profile.username} - Dicționar urban`,
    description: `Definițiile adăugate de ${profile.username} pe dexurban.md`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const name = await resolveName(params);
  if (!name) notFound();

  const profile = await getPublicProfile(name);
  if (!profile) notFound();

  // Normalizează URL-ul la porecla canonică (casing/diacritice sau user redenumit).
  if (profile.username !== name) {
    redirect(`/profil/${encodeURIComponent(profile.username)}`);
  }

  const sp = searchParams ? await searchParams : {};
  const page = sp.page ?? "1";
  const popularity = sp.popularity ?? "1";

  return (
    <>
      <ProfileHeader profile={profile} />
      <Suspense>
        {/* Fără „Trage la sorți" aici: ești pe lista cuiva anume, iar butonul
            te-ar arunca la un cuvânt aleator de pe tot site-ul. */}
        <Definition
          query={`@${profile.username}`}
          page={page}
          popularity={popularity}
          showRandom={false}
        />
      </Suspense>
    </>
  );
}
