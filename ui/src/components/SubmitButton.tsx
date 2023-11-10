import React from 'react';

interface SubmitButtonProps {
  prompt: string;
  handleSubmit: () => void;
}

const SubmitButton = (props: SubmitButtonProps) => {
  const { prompt, handleSubmit } = props;
  return (
    <button
      id="prompt"
      name="prompt"
      value={prompt}
      onClick={handleSubmit}
    > Submit </button>
  );
}

export default SubmitButton;