'use client';

import { useStory } from "@/hooks/useStory";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { StoryWithPages } from "@/types/story";

export default function Page() {
  const { currentStory, initializeStory } = useStory();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<StoryWithPages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStories = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setLoading(true);
        try {
          // Fetch all stories for the user
          const response = await fetch(`/api/stories?userId=${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setStories(data.stories);

            // If no stories exist, create one and redirect
            if (data.stories.length === 0) {
              const createResponse = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: session.user.email,
                  title: `Story - ${new Date().toLocaleDateString()}`
                }),
              });

              if (createResponse.ok) {
                const { story } = await createResponse.json();
                router.push(`/story/${story.id}`);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching stories:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initStories();
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primer-lightest">
        <div className="text-primer-primary">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-primer-lightest">
        <div className="text-primer-primary">Please sign in to view your stories</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-primer-primary mb-6">Your Stories</h1>

      <div className="grid gap-6">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="block bg-primer-lightest border border-primer-dark rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-primer-primary mb-2">
                  {story.title}
                </h2>
                <div className="text-primer-primary text-sm">
                  {story.pages.length} pages
                </div>
                <div className="text-primer-primary text-sm">
                  Last updated: {new Date(story.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {story.pages.length > 0 && (
                <div className="text-sm text-primer-primary">
                  Latest page: {story.pages[story.pages.length - 1].pageNum}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={async () => {
          if (session?.user?.email) {
            const response = await fetch('/api/stories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                title: `Story - ${new Date().toLocaleDateString()}`
              }),
            });

            if (response.ok) {
              const { story } = await response.json();
              router.push(`/story/${story.id}`);
            }
          }
        }}
        className="mt-6 px-6 py-3 bg-primer-dark text-primer-lightest rounded-lg hover:bg-primer-darkest transition-colors"
      >
        Create New Story
      </button>
    </div>
  );
}