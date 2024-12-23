import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new user
export async function createUser(email: string, name?: string): Promise<User> {
  return prisma.user.create({
    data: {
      email,
      name,
    },
  });
}

// Read a user by id
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

// Read a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

// Read all users
export async function getAllUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

// Update a user
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// Delete a user
export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id },
  });
}

// Close the Prisma client connection
export async function closeConnection(): Promise<void> {
  await prisma.$disconnect();
}


