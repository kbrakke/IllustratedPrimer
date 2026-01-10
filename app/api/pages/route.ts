import { NextResponse } from 'next/server';
import * as pageDB from '@/lib/db/pages';

export async function POST(request: Request) {
  const body = await request.json();
  const { storyId, pageData } = body;

  if (!storyId || !pageData) {
    return NextResponse.json({ error: 'Story ID and page data are required' }, { status: 400 });
  }

  try {
    const page = await pageDB.createPage(storyId, pageData);
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
} 