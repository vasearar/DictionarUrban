import { redirect } from "next/navigation";

// Panoul a fost unificat în /panou (tab-urile de admin apar pe rol).
export default function AdminPage() {
  redirect("/panou");
}
