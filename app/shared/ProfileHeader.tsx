import React from "react";
import { PublicProfile } from "@/lib/profile";
import ProfileBadges from "./ProfileBadges";
import AchievementsButton from "./badges/AchievementsButton";

// Antetul paginii de profil public — layout oglindit după DashboardInfo,
// dar read-only (fără sesiune, fără butoane de acțiune).

const ROLE_LABELS: Record<PublicProfile["role"], string> = {
  user: "Utilizator",
  moderator: "Moderator",
  admin: "Administrator",
};

// users.date e scris la înregistrare ca string deja localizat ("9 iulie 2026"),
// dar fallback-urile de pe server salvează ISO — pe acelea le reformatăm.
function formatMemberSince(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(date)) {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    }
  }
  return date;
}

export default function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const { username, role, memberSince, definitionCount, badges } = profile;
  const isStaff = role === "moderator" || role === "admin";
  const countLabel = definitionCount === 1 ? "1 definiție" : `${definitionCount} definiții`;

  return (
    <div className="w-full flex justify-between my-12 font-Spacegrotesc">
      {/* Identitatea la stânga, „Trofee" la dreapta, aliniat sus cu porecla:
          rândul era deja justify-between cu un singur copil, deci toată partea
          dreaptă stătea goală, iar butonul se așeza între identitate și lista de
          definiții — exact în drum. Pe mobil coboară sub identitate. */}
      <div className="mx-auto flex w-full flex-col gap-4 px-3 md:px-0 md:w-[71%] sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bold text-5xl font-Spacegrotesc break-all">{username}</h1>
            <span
              className={`relative border-2 border-mygray bg-mywhite mydropshadow px-2 text-sm font-bold ${
                isStaff ? "text-myorange" : ""
              }`}
            >
              {ROLE_LABELS[role]}
            </span>
          </div>
          <h6 className="text-zinc-500">
            {memberSince ? `Membru din ${formatMemberSince(memberSince)} · ` : ""}
            {countLabel}
          </h6>
          <ProfileBadges badges={badges} />
        </div>
        <AchievementsButton username={username} />
      </div>
    </div>
  );
}
