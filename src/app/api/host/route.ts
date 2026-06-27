import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const interfaces = os.networkInterfaces();
  let ip = "localhost";

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    for (const info of iface) {
      if (info.family === "IPv4" && !info.internal) {
        ip = info.address;
        break;
      }
    }
    if (ip !== "localhost") break;
  }

  return NextResponse.json({ ip, port: process.env.PORT || 3000 });
}