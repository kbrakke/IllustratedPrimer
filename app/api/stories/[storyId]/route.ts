import { NextResponse } from 'next/server';
import * as storyDB from '@/lib/db/stories';
import { auth } from "@/auth"

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { storyId } = params;
  
  if (!storyId) {
    return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
  }

  try {
    const story = await storyDB.getStory(storyId);
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Verify the user owns this story
    if (story.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
} 