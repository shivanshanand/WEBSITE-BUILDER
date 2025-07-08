import { prisma } from "./prisma.js";

export async function createUser({ email, name, image, username }) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        image,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "User with this email or username already exists",
      };
    }

    return {
      success: false,
      error: "Failed to create user",
    };
  }
}

export async function findUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        image: true,
        emailVerified: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

export async function findUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        image: true,
        emailVerified: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

export async function updateUserProfile(id, data) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        username: data.username,
        bio: data.bio,
        website: data.website,
        location: data.location,
        image: data.image,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        updatedAt: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "Username already taken",
      };
    }

    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

export async function updateEmailVerification(email, verified = true) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: verified ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating email verification:", error);
    return {
      success: false,
      error: "Failed to update email verification",
    };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

export async function createConversation(userId, title = null) {
  return prisma.conversation.create({
    data: { 
      userId, 
      title: title || "New Chat" 
    },
  });
}

// Update conversation title based on first user message
export async function updateConversationTitle(conversationId, title) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
  });
}

// Append a message
export async function createMessage(conversationId, role, content) {
  // Create the message and update conversation timestamp
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, role, content },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
}

// (Optional) list convos or messages if you need them later
export async function getConversationsByUser(userId) {
  return prisma.conversation.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}
export async function getConversationById(id) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function deleteConversation(conversationId) {
  return prisma.conversation.delete({
    where: { id: conversationId },
  });
}

export async function getOrCreateDefaultConversation(userId) {
  // This function should only be used when we need a fallback conversation
  // In normal flow, we should always have a conversation ID passed
  let convo = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  // If none exists, create one with a default title
  if (!convo) {
    convo = await createConversation(userId, "New Chat");
  }
  return convo;
}