import { useChat } from 'ai/react';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({});
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col h-screen bg-earth-lightest/10">
      <div className="flex-1 overflow-y-auto p-4 pb-36">
        {messages.map(m => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap rounded-lg p-4 mb-4 shadow-sm ${m.role === 'user'
              ? 'bg-white border border-earth-lightest'
              : 'bg-earth-lightest/20 border border-earth-light/20'
              }`}
          >
            <div className="font-semibold mb-2 text-earth-dark">
              {m.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="text-earth-dark">
              {m.content}
            </div>
            <div>
              {m?.experimental_attachments
                ?.filter(attachment =>
                  attachment?.contentType?.startsWith('image/'),
                )
                .map((attachment, index) => (
                  <Image
                    key={`${m.id}-${index}`}
                    src={attachment.url}
                    width={500}
                    height={500}
                    alt={attachment.name ?? `attachment-${index}`}
                    className="rounded-lg mt-2 border border-earth-lightest"
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-earth-lightest shadow-lg">
        <form
          onSubmit={event => {
            handleSubmit(event, {
              experimental_attachments: files,
            });
            setFiles(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <input
            type="file"
            className="flex-none text-sm text-earth-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                     file:text-sm file:font-semibold file:bg-earth-lightest/20 file:text-earth-dark 
                     hover:file:bg-earth-lightest/30 file:transition-colors"
            onChange={event => {
              if (event.target.files) {
                setFiles(event.target.files);
              }
            }}
            multiple
            ref={fileInputRef}
          />
          <input
            className="flex-1 p-2 border border-earth-lightest rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-earth-light/50 focus:border-transparent
                     placeholder-earth-light/50"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-earth-light text-earth-lightest rounded-lg font-medium 
                     hover:bg-earth-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}