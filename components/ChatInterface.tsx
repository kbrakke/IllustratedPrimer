'use client';

import { useChat } from 'ai/react';
import { useRef, useState, useEffect } from 'react';
import { useStory } from '@/hooks/useStory';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function ChatInterface() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentStory, currentPage, savePageToStory } = useStory();
  const pathname = usePathname();

  // Extract story and page context from URL
  const getPageContext = () => {
    const storyMatch = pathname.match(/\/story\/([^\/]+)(?:\/page\/(\d+))?/);
    if (storyMatch) {
      return {
        storyId: storyMatch[1],
        pageNum: storyMatch[2]
      };
    }
    return null;
  };

  const { messages, input, handleInputChange, handleSubmit: chatSubmit } =
    useChat({
      onFinish: async (message) => {

        const lastUserMessage = messages[messages.length - 2];
        if (lastUserMessage && lastUserMessage.role === 'user') {
          const pageContext = getPageContext();
          if (!pageContext?.storyId) {
            console.error('No current story available');
            return;
          }

          await savePageToStory({
            prompt: lastUserMessage.content,
            completion: message.content,
            summary: '',
            image: message.experimental_attachments?.[0]?.url || '',
            pageNum: pageContext?.pageNum ? parseInt(pageContext.pageNum) + 1 : 1,
            audioFile: '',
          });
        }
      },
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentStory) {
      console.error('No current story available');
      return;
    }

    await chatSubmit(event, {
      experimental_attachments: files,
    });

    // Reset file input
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-primer-lightest p-4 border-t border-primer-dark shadow-lg">
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 max-w-4xl mx-auto"
      >
        <input
          type="file"
          className="flex-none text-sm text-primer-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                   file:text-sm file:font-semibold file:bg-primer-light file:text-primer-primary 
                   hover:file:bg-primer-dark/10 file:transition-colors"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          className="flex-1 p-2 border border-primer-dark rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-primer-dark/50 focus:border-transparent
                   placeholder-primer-dark/50 text-primer-primary"
          value={input}
          placeholder={getPageContext() ? "Continue the story..." : "Start a new story..."}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primer-dark text-primer-lightest rounded-lg font-medium 
                   hover:bg-primer-darkest transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}