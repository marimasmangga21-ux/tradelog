import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Journal } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { journals, targetEmail } = await req.json() as { journals: Journal[]; targetEmail?: string };

    if (!Array.isArray(journals) || journals.length === 0) {
      return NextResponse.json({ ok: false, error: "No journals provided" }, { status: 400 });
    }

    if (!targetEmail) {
      return NextResponse.json({ ok: false, error: "targetEmail required" }, { status: 400 });
    }

    // Upsert ke Supabase journals table
    const { error } = await supabase
      .from("journals")
      .upsert(
        journals.map(j => ({
          ...j,
          user_email: targetEmail
        })),
        { onConflict: "id" }
      );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, added: journals.length, total: journals.length });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to import journals" },
      { status: 500 }
    );
  }
}
