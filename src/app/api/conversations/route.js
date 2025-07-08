// src/app/api/conversations/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createConversation, getConversationsByUser } from "@/lib/user-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getConversationsByUser(session.user.id);
    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  // authenticate
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // safe JSON parse
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const title = typeof body.title === "string" ? body.title : null;

  // create and return
  try {
    const convo = await createConversation(session.user.id, title);
    return NextResponse.json(convo, { status: 201 });
  } catch (err) {
    console.error("createConversation error:", err);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}