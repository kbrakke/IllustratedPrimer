interface PromptProps {
  prompt: string;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: React.MouseEventHandler<HTMLButtonElement>;
}

const Prompt = (props: PromptProps) => {
  const { prompt, handleChange, handleSubmit } = props;
  return (
    <div className='relative h-1/2 w-full'>
      <textarea
        className="flex w-full h-full border-2 border-gray-500 hover:border-blue-500 rounded shadow-inner bg-orange-100 font-storybook text-xl p-2"
        id="prompt"
        name="prompt"
        value={prompt}
        placeholder="The Story Continues..."
        onChange={handleChange}
      />
      <button
        className='absolute right-0 bottom-0 bg-gray-500 hover:bg-blue-500 border-2 border-gray-500 hover:border-blue-500 rounded'
        id="prompt"
        name="prompt"
        value={prompt}
        onClick={handleSubmit}
      > Submit </button>
    </div>
  );
}

export default Prompt;