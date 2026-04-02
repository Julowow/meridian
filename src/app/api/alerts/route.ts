import { NextRequest, NextResponse } from "next/server";
import {
  getAlertRules,
  addAlertRule,
  removeAlertRule,
  toggleAlertRule,
} from "@/lib/alerts";

export const dynamic = "force-dynamic";

// GET — list all alert rules
export async function GET() {
  return NextResponse.json({ rules: getAlertRules() });
}

// POST — create a new alert rule
export async function POST(request: NextRequest) {
  const body = await request.json();
  const keywords: string[] = body.keywords;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json(
      { error: "keywords array required" },
      { status: 400 }
    );
  }

  const rule = addAlertRule(keywords);
  return NextResponse.json({ rule }, { status: 201 });
}

// DELETE — remove an alert rule
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const removed = removeAlertRule(id);
  return NextResponse.json({ removed });
}

// PATCH — toggle an alert rule
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const id: string = body.id;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const rule = toggleAlertRule(id);
  if (!rule) {
    return NextResponse.json({ error: "rule not found" }, { status: 404 });
  }

  return NextResponse.json({ rule });
}
