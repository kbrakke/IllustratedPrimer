import React from 'react';

function Prompt({ prompt, handleChange }) {
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