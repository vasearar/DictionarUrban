import { redirect } from "next/navigation";

// Panoul a fost unificat în /panou (gărzile de rol sunt acolo).
export default function ModeratorPage() {
  redirect("/panou");
}
