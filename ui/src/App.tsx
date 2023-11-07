import React, { useEffect, useState } from "react";
import Prompt from "./Prompt";
import Completion from "./Completion";
import Image from "./Image";
import Summary from "./Summary";
import SubmitButton from "./SubmitButton";
import { config } from "./config";

function App() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("Waiting for Response");
  const [waitingForSummary, setWaitingForSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [image, setImage] = useState("");

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
    await handleSummary();
  }

  const handleSummary = async () => {
    setWaitingForSummary(true);
    const response = await fetch(`${config.baseUrl}/ai/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, completion })
    });
    const body = await response.json();
    setSummary(body.summary);
    setImagePrompt(body.imagePrompt);
    setWaitingForSummary(false);
  }
  useEffect(() => {
    if(imagePrompt === "") return;
    fetch(`${config.baseUrl}/ai/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({prompt: imagePrompt})
    }).then(response => response.json()).then(body => {
      console.log(body)
      setImage(body.url)
    });
  }, [imagePrompt]);

  return (
    <div>
      <h2>Prompt</h2>
      <Prompt prompt={prompt} handleChange={handleChange} />
      <h2>Submit</h2>
      <SubmitButton prompt={prompt} handleSubmit={handleSubmit} />
      <h2>Response</h2>
      <Completion completion={completion} />
      <h2>Summary</h2>
      <Summary summary={summary} />
      <h2>Image</h2>
      <Image image={image} imagePrompt={imagePrompt} />
    </div>
  )
}

export default App;