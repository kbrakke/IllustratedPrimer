import { getUserStories } from '../../lib/db/stories';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function StoriesPage() {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId');

  if (!userId) {
    return (
      <div className="container mx-auto p-4">
        <p>Please log in to view your stories.</p>
      </div>
    );
  }

  const stories = await getUserStories(userId.value);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Stories</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
            <p className="text-gray-600 mb-4">{story.summary}</p>
            <div className="text-sm text-gray-500">
              {story.pages.length} pages • Last updated:{' '}
              {new Date(story.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>

      {stories.length === 0 && (
        <p className="text-gray-600">You haven't created any stories yet.</p>
      )}
    </div>
  );
} 