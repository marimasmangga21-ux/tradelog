import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDiskPath } from "@/lib/store/db";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** Sajikan gambar dari folder data/uploads (mis. contoh chart strategi). */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const relative = segments.join("/");

  const root = uploadDiskPath("");
  const target = uploadDiskPath(relative);

  // Cegah path traversal keluar dari folder uploads.
  if (!path.resolve(target).startsWith(path.resolve(root))) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buffer = await readFile(target);
    const ext = relative.split(".").pop()?.toLowerCase() ?? "png";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
