import { authConfig } from "@/app/confings/auth";
import PanelDashboard from "./PanelDashboard";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Panoul unic pentru echipa de moderare. Rolul citit din DB (sursa de adevăr),
// nu din token — un cont banat sau retrogradat e blocat aici indiferent de sesiune.
export default async function PanelPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect("/conectare");
  }

  await connectDB();
  const user = await userModel.findOne({ email: session.user.email });

  if (!user || user.banned || !["moderator", "admin"].includes(user.role || "user")) {
    redirect("/");
  }

  return <PanelDashboard role={user.role as "moderator" | "admin"} />;
}
