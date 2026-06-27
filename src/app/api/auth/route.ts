import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    enabled: !!process.env.ADMIN_PASSWORD,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: true });
    }

    if (body.password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "wrong password" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "auth failed" }, { status: 500 });
  }
}