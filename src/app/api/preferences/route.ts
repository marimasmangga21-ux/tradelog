import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";
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

  const profile = await mutateDb(
    (db) => {
      Object.assign(db.profile, parsed.data, { updated_at: nowIso() });
      return { ...db.profile };
    },
    { keepSample: true },
  );

  return NextResponse.json({ ok: true, profile });
}
