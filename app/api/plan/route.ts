import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { ability, weeks } = body;

  return NextResponse.json({
    plan: `Couch to 5K plan for a ${ability} runner over ${weeks} weeks`,
  });
}
