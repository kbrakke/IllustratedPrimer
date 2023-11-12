interface PromptProps {
  prompt: string;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: React.MouseEventHandler<HTMLButtonElement>;
}

const Prompt = (props: PromptProps) => {
  const { prompt, handleChange, handleSubmit } = props;
  return (
    <div className='relative'>
      <textarea
        className="flex w-full h-full 4border-2 border-gray-500 hover:border-blue-500 rounded"
        id="prompt"
        name="prompt"
        value={prompt}
        onChange={handleChange}
      />
      <button
        className='absolute right-0'
        id="prompt"
        name="prompt"
        value={prompt}
        onClick={handleSubmit}
      > Submit </button>
    </div>
  );
}

export default Prompt;