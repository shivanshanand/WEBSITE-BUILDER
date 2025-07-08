import { NextResponse } from "next/server";
import {
  findUserById,
  updateUserProfile,
  deleteUser,
} from "@/lib/user-service";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await findUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateUserProfile(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteUser(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
