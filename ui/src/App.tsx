import { useState } from "react";
import Prompt from "./Prompt";
import Completion from "./Completion";
import SubmitButton from "./SubmitButton";
import { config } from "./config";

function App() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("Waiting for Response");

  const handleChange = (event: any) => {
    setPrompt(event.target.value);
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const response = await fetch(`${config.baseUrl}/ai/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });
    const body = await response.json();
    setCompletion(body.text);
  }
  return (
    <div>
      <h2>Prompt</h2>
      <Prompt prompt={prompt} handleChange={handleChange} />
      <h2>Submit</h2>
      <SubmitButton prompt={prompt} handleSubmit={handleSubmit} />
      <h2>Response</h2>
      <Completion completion={completion} />
    </div>
  )
}

export default App;