import { getStory } from '@/lib/db/stories';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function StoryPageDetail({
  params: { storyId, pageNum },
}: {
  params: { storyId: string; pageNum: string };
}) {
  const story = await getStory(storyId);
  if (!story) {
    notFound();
  }

  const currentPage = story.pages.find(
    (page) => page.pageNum === parseInt(pageNum)
  );
  if (!currentPage) {
    notFound();
  }

  const nextPage = story.pages.find(
    (page) => page.pageNum === parseInt(pageNum) + 1
  );
  const prevPage = story.pages.find(
    (page) => page.pageNum === parseInt(pageNum) - 1
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Link href={`/story/${storyId}`} className="text-blue-500 hover:underline">
          ← Back to Story
        </Link>
      </div>

      <div className="grid gap-8">
        <div className="aspect-w-16 aspect-h-9 relative h-[400px]">
          <Image
            src={currentPage.image}
            alt={`Illustration for page ${pageNum}`}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold mb-4">
            {story.title} - Page {pageNum}
          </h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p>{currentPage.summary}</p>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Story</h2>
            <p>{currentPage.completion}</p>
          </div>
        </div>

        {currentPage.audioFile && (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={currentPage.audioFile} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {prevPage ? (
            <Link
              href={`/story/${storyId}/page/${prevPage.pageNum}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ← Previous Page
            </Link>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Link
              href={`/story/${storyId}/page/${nextPage.pageNum}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next Page →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
} 