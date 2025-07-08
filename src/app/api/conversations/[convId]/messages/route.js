// src/app/api/conversations/[convId]/messages/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createMessage } from "@/lib/user-service";

export async function GET() {
  // stub: return empty for now
  return NextResponse.json([], { status: 200 });
}


export async function POST(request, context) {
  // authenticate
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // await params.convId
  const { convId } = await context.params;
  if (!convId) {
    return NextResponse.json(
      { error: "Conversation ID is required" },
      { status: 400 }
    );
  }

  // parse + validate
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { role, content } = body;
  if (typeof role !== "string" || typeof content !== "string") {
    return NextResponse.json(
      { error: "Both `role` and `content` strings are required" },
      { status: 400 }
    );
  }

  // persist and return
  try {
    const msg = await createMessage(convId, role, content);
    return NextResponse.json(msg, { status: 201 });
  } catch (err) {
    console.error("createMessage error:", err);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}