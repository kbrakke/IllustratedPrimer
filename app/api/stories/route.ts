import { NextResponse } from 'next/server';
import * as storyDB from '@/lib/db/stories';
import * as userDB from '@/lib/db/users';
import { User } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  
  if (!email && !userId) {
    return NextResponse.json({ error: 'Email or userId is required' }, { status: 400 });
  }

  try {
    let user: User | null = null;
    if (userId) {
      user = await userDB.getUserById(userId);
    } else if (email) {
      user = await userDB.getUserByEmail(email);
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const stories = await storyDB.getUserStories(user.id);
    return NextResponse.json({ stories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, title } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    let user = await userDB.getUserByEmail(email);
    if (!user) {
      user = await userDB.createUser(email);
    }
    const story = await storyDB.createStory(user.id, title || `Story - ${new Date().toLocaleDateString()}`);
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
} 