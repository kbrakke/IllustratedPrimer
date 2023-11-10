import React from 'react';

interface PromptProps {
  prompt: string;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Prompt = (props: PromptProps) => {
  const { prompt, handleChange } = props;
  return (
    <textarea
      id="prompt"
      name="prompt"
      value={prompt}
      onChange={handleChange}
    />
  );
}

export default Prompt;