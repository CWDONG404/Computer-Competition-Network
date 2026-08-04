import { NextResponse } from "next/server";
import { healthcheck } from "@/lib/db";

export async function GET() {
  try {
    const database = await healthcheck();
    return NextResponse.json({ ok: true, database }, { status: database ? 200 : 503 });
  } catch {
    return NextResponse.json({ ok: false, database: false }, { status: 503 });
  }
}
