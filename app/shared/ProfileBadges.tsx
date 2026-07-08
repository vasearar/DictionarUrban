import React from "react";
import { PublicBadge } from "@/lib/profile";

// Slot pentru badge-urile viitoare (iconițe/titluri de obținut). Deocamdată
// API-ul întoarce mereu o listă goală, deci componenta nu randează nimic.

export default function ProfileBadges({ badges }: { badges: PublicBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge) => (
        <span
          key={badge.id}
          className="border-2 border-mygray bg-mywhite mydropshadow px-2 text-sm font-bold flex items-center gap-1"
        >
          {badge.icon && <span aria-hidden="true">{badge.icon}</span>}
          {badge.label}
        </span>
      ))}
    </div>
  );
}
