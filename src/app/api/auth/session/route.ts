import { NextResponse } from "next/server";
import { readDb } from "@/lib/store/db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({
    authenticated: true,
    hasGoogleCredentials: false,
    user: {
      name: db.profile.name || "Evan Mita",
      email: db.profile.email || "evan.trader21@gmail.com",
      avatar_url: db.profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
    },
  });
}
