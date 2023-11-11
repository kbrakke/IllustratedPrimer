import React, { MouseEventHandler, useEffect, useState } from 'react'
import Prompt from './Prompt'
import Completion from './Completion'
import Summary from './Summary'
import SaveButton from './SaveButton'
import Image from './Image'


const NewPage = () => {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("Waiting for Response");
  const [waitingForSummary, setWaitingForSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [image, setImage] = useState("");
  const handleChange = (event: any) => {
    setPrompt(event.target.value);
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    const response = await fetch(`http://localhost:3001/ai/completion`, {
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
    const response = await fetch(`http://localhost:3001/ai/summary`, {
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

  const handleSave = async () => {
    console.log("saving");
    async function savePrompt() {
      const response = await fetch(`http://localhost:3001/pages/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          completion: completion,
          summary: summary,
          image: image,
          number: (pages?.length || 0) + 1,
          storyId: stories[0].id
        })
      });
      const body = await response.json();
      console.log(body);
    }

    savePrompt();
  }

  useEffect(() => {
    if (imagePrompt === "") return;
    fetch(`http://localhost:3001/ai/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: imagePrompt })
    }).then(response => response.json()).then(body => {
      console.log(body)
      setImage(body.url)
    });
  }, [imagePrompt]);

  return (
    <div className="flex-1 border-8 border-red-500 h-5/6">
      <div className="flex-1 border-8 border-green-500 h-1/6">
        <h2>Prompt</h2>
        <Prompt prompt={prompt} handleChange={handleChange} handleSubmit={handleSubmit} />
      </div>
      <div className="flex-1 border-8 border-green-500 h-1/3">
        <h2>Response</h2>
        <Completion completion={completion} />
        <h2>Summary</h2>
        <Summary summary={summary} />
        <SaveButton disabled={!prompt || !completion || !summary || !image} handleSave={handleSave} />
      </div>
      <div className="flex-1 border-8 border-blue-500 h-1/2">
        <h2>Image</h2>
        <Image image={image} imagePrompt={imagePrompt} />
      </div>
    </div>
  )
}

export default NewPage