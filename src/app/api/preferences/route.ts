import { NextResponse } from "next/server";
import { mutateDb, nowIso, getActiveUserEmail } from "@/lib/store/db";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Data tidak valid" }, { status: 400 });
  }

  const currentTime = nowIso();

  // 1. Simpan ke Supabase permanen
  try {
    const { supabase } = await import("@/lib/supabase");
    const email = await getActiveUserEmail();

    const { error } = await supabase.from("profiles").upsert(
      {
        email,
        ...parsed.data,
        updated_at: currentTime,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[Preferences API] Supabase upsert error:", error);
    }
  } catch (err) {
    console.error("[Preferences API] Supabase error:", err);
  }

  // 2. Simpan juga ke local db instance
  const profile = await mutateDb(
    (db) => {
      Object.assign(db.profile, parsed.data, { updated_at: currentTime });
      return { ...db.profile };
    },
    { keepSample: true },
  );

  return NextResponse.json({ ok: true, profile });
}
