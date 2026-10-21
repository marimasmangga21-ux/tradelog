import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readDb, screenshotDiskPath } from "@/lib/store/db";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** Sajikan file screenshot dari folder data/screenshots. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = await readDb();
  const shot = db.screenshots.find((s) => s.id === id);
  if (!shot) return new NextResponse("Not found", { status: 404 });

  // storage_path bisa berupa URL absolut (mis. diisi manual).
  if (/^https?:\/\//i.test(shot.storage_path)) {
    return NextResponse.redirect(shot.storage_path);
  }

  let target = screenshotDiskPath(shot.storage_path);
  // Cegah path traversal keluar dari folder screenshots.
  const root = screenshotDiskPath("");
  if (!path.resolve(target).startsWith(path.resolve(root))) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    let buffer: Buffer;
    try {
      buffer = await readFile(target);
    } catch {
      // Fallback jika nama file berbeda format (_mtf vs plain)
      const altName = shot.storage_path.includes("_mtf")
        ? shot.storage_path.replace("_mtf.png", ".png")
        : shot.storage_path.replace(".png", "_mtf.png");
      const altTarget = screenshotDiskPath(altName);
      buffer = await readFile(altTarget);
      target = altTarget;
    }

    const ext = target.split(".").pop()?.toLowerCase() ?? "png";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
