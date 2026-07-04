import { authConfig } from "@/app/confings/auth";
import AdminDashboard from "./AdminDashboard";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect("/conectare");
  }

  await connectDB();
  const user = await userModel.findOne({ email: session.user.email });

  if (!user || user.banned || user.role !== "admin") {
    redirect("/");
  }

  return <AdminDashboard />;
}
