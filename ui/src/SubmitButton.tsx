function SubmitButton({ prompt, handleSubmit }) {
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