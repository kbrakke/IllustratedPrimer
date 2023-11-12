import { MouseEventHandler } from 'react';

interface SubmitButtonProps {
  prompt: string;
  handleSubmit: MouseEventHandler<HTMLButtonElement>;
}

const SubmitButton = (props: SubmitButtonProps) => {
  const { prompt, handleSubmit } = props;
  return (
    <button
      className='right=0'
      id="prompt"
      name="prompt"
      value={prompt}
      onClick={handleSubmit}
    > Submit </button>
  );
}

export default SubmitButton;