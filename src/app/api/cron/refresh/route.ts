import { NextResponse } from "next/server";
import { runIngest } from "@/lib/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runIngest();
    return NextResponse.json({
      ok: true,
      generatedAt: result.metaFile.generatedAt,
      totals: result.metaFile.totals,
      log: result.log,
      note: "Vercel serverless filesystem is read-only. This endpoint verifies the ingestion pipeline and returns fresh data inline. The canonical nightly refresh is a GitHub Action that commits updated /public/data/*.json to main.",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
