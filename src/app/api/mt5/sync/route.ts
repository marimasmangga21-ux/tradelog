import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "mt5_sync.py");
    const { stdout, stderr } = await execFileAsync("python", [scriptPath], {
      timeout: 30000,
      cwd: process.cwd(),
      windowsHide: true,
    });

    // Parse output JSON dari baris terakhir
    const lines = stdout.trim().split("\n");
    let result = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        result = JSON.parse(lines[i]);
        break;
      } catch {
        // lanjut baris sebelumnya
      }
    }

    if (!result) {
      return NextResponse.json({
        ok: false,
        error: "Gagal membaca output sinkronisasi MT5",
        raw: stdout,
        stderr,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Gagal menjalankan sinkronisasi MT5",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
