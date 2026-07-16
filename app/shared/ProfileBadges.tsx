import React from "react";
import { PublicBadge } from "@/lib/profile";
import { BadgeIcon } from "./badges/BadgeIcons";

// Chip-ul cu medalia aleasă pentru profil. E cel mult una — restul colecției se
// vede în modalul „Medalii". Medaliile speciale (staff, influencer, endgame) au
// chip inversat cu umbră portocalie, ca să se vadă de la un kilometru.

export default function ProfileBadges({ badges }: { badges: PublicBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={`relative border-2 border-mygray px-2 py-[2px] text-sm font-bold flex items-center gap-[6px] ${
            badge.special
              ? "bg-mygray text-mywhite myorangedropshadow"
              : "bg-mywhite text-mygray mydropshadow"
          }`}
        >
          <BadgeIcon id={badge.id} size={18} />
          {badge.label}
        </span>
      ))}
    </div>
  );
}
