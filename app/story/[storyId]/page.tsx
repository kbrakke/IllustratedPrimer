import { getStory } from '@/lib/db/stories';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function StoryOverview({
  params: { storyId },
}: {
  params: { storyId: string };
}) {
  const story = await getStory(storyId);

  if (!story) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid gap-6">
        {story.pages.map((page) => (
          <Link
            key={page.pageNum}
            href={`/story/${storyId}/page/${page.pageNum}`}
            className="block bg-primer-lightest border border-primer-dark rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-6">
              {page.image && (
                <div className="flex-shrink-0 w-48 h-32 relative">
                  <Image
                    src={page.image}
                    alt={`Illustration for page ${page.pageNum}`}
                    fill
                    className="object-cover rounded-lg border border-primer-dark"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-primer-primary mb-2">
                  Page {page.pageNum}
                </h2>
                <div className="text-primer-primary line-clamp-2 mb-2">
                  <strong>Prompt:</strong> {page.prompt}
                </div>
                <div className="text-primer-primary line-clamp-3">
                  <strong>Story:</strong> {page.completion}
                </div>
                {page.audioFile && (
                  <div className="mt-2 text-primer-primary text-sm">
                    🎵 Audio narration available
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {story.pages.length === 0 && (
          <div className="text-center py-12 bg-primer-lightest border border-primer-dark rounded-lg">
            <p className="text-primer-primary">
              No pages in this story yet. Start writing to create your first page!
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/"
          className="px-4 py-2 bg-primer-light text-primer-primary rounded-lg hover:bg-primer-dark/10 transition-colors"
        >
          ← Back to Stories
        </Link>
        {story.pages.length > 0 && (
          <Link
            href={`/story/${storyId}/page/${story.pages[story.pages.length - 1].pageNum}`}
            className="px-4 py-2 bg-primer-dark text-primer-lightest rounded-lg hover:bg-primer-darkest transition-colors"
          >
            Continue Story →
          </Link>
        )}
      </div>
    </div>
  );
} 