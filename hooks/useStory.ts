import { useState, useCallback, useRef } from 'react';
import { Story, Page } from '@prisma/client';
import type { StoryWithPages } from '@/types/story';

export function useStory(storyId?: string) {
  const [currentStory, setCurrentStory] = useState<StoryWithPages | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const initializationPromise = useRef<Promise<void> | null>(null);

  const initializeStory = useCallback(async (userId: string) => {
    // If already initializing, return the existing promise
    if (initializationPromise.current) {
      return initializationPromise.current;
    }

    // Create new initialization promise
    initializationPromise.current = (async () => {
      try {
        let response;
        if (storyId) {
          // Fetch specific story
          response = await fetch(`/api/stories/${storyId}`);
        } else {
          // Fetch user's stories
          response = await fetch(`/api/stories?userId=${encodeURIComponent(userId)}`);
        }
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        let story: StoryWithPages | null = null;
        
        if (storyId) {
          story = data.story;
        } else if (data.stories.length > 0) {
          story = data.stories.reduce((latest: StoryWithPages, current: StoryWithPages) => {
            const latestPage = latest.pages[latest.pages.length - 1];
            const currentPage = current.pages[current.pages.length - 1];
            
            if (!latestPage) return current;
            if (!currentPage) return latest;
            
            return currentPage.createdAt > latestPage.createdAt ? current : latest;
          });
        }
        
        if (!story && !storyId) {
          const createResponse = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          const createData = await createResponse.json();
          if (!createResponse.ok) throw new Error(createData.error);
          story = createData.story;
        }

        setCurrentStory(story);
        if (story) {
          setCurrentPage(story.pages[story.pages.length - 1] || null);
        }
      } catch (error) {
        console.error('Error initializing story:', error);
      } finally {
        // Clear the promise reference after completion
        initializationPromise.current = null;
      }
    })();

    return initializationPromise.current;
  }, [storyId]);

  const savePageToStory = async (pageData: {
    prompt: string;
    completion: string;
    summary: string;
    image: string;
    pageNum: number;
    audioFile?: string;
  }) => {
    if (!currentStory) {
      console.error('No current story available');
      return;
    }

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: currentStory.id,
          pageData,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setCurrentPage(data.page);
      
      // Update current story with new page
      setCurrentStory(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: [...prev.pages, data.page],
        };
      });
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  return {
    currentStory,
    currentPage,
    initializeStory,
    savePageToStory,
  };
} 