import { NextResponse } from "next/server";

/**
 * Demo mode: this endpoint used to e-mail the Hoizr team. Hoizr is sunset and
 * open-sourced, so nothing is sent anywhere — the submission is acknowledged
 * and discarded so every form still "works" end-to-end.
 * Original implementation: see the `main` branch.
 */
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ ok: true, demo: true });
}
