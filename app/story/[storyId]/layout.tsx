import { getStory } from '../../../lib/db/stories';
import { notFound } from 'next/navigation';

export default async function StoryLayout({
  children,
  params: { storyId },
}: {
  children: React.ReactNode;
  params: { storyId: string };
}) {
  const story = await getStory(storyId);

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4">
          <h1 className="text-xl font-semibold">{story.title}</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 