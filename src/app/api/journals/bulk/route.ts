import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/store/db";
import type { Journal } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { journals, targetEmail } = await req.json() as { journals: Journal[]; targetEmail?: string };

    if (!Array.isArray(journals) || journals.length === 0) {
      return NextResponse.json({ ok: false, error: "No journals provided" }, { status: 400 });
    }

    const result = await mutateDb(
      (draft) => {
        let added = 0;
        for (const journal of journals) {
          const exists = draft.journals.some((j) => j.id === journal.id);
          if (!exists) {
            draft.journals.push(journal);
            added++;
          }
        }
        return { added, total: journals.length };
      },
      { targetEmail }
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to import journals" },
      { status: 500 }
    );
  }
}
