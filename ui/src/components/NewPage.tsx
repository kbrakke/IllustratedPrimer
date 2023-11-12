import { MouseEventHandler, useEffect, useState } from 'react'
import Prompt from './Prompt'
import Summary from './Summary'
import SaveButton from './SaveButton'
import Image from './Image'
import FadeInText from './FadeInText'


interface NewPageProps {
  pageCount: number;
  currentState: any;
  setCurrentState: any;
}

const NewPage = (props: NewPageProps) => {
  const { pageCount, currentState, setCurrentState } = props;
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("Waiting for Response");
  const [, setWaitingForSummary] = useState(false);
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

  const resetFields = () => {
    setPrompt("");
    setCompletion("");
    setSummary("");
    setImage("");
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
          number: pageCount + 1,
          storyId: currentState.story.id
        })
      });
      const body = await response.json();
      console.log(body);
    }

    savePrompt();
    setCurrentState({
      page: {
        prompt: prompt,
        completion: completion,
        summary: summary,
        image: image,
        number: pageCount + 1,
      },
      story: currentState.story,
      author: currentState.author,
    });
    resetFields();
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
      setImage(body.b64_json)
    });
  }, [imagePrompt]);

  return (
    <div className="flex-1 border-8 bg-orange-200 text-center">
      <div className="flex-1 border-8 border-green-500 h-1/6">
        <Prompt prompt={prompt} handleChange={handleChange} handleSubmit={handleSubmit} />
      </div>
      <div className="flex-1 border-8 border-green-500 h-1/6">
        <FadeInText text={completion} initialDelay={0} />
        <Summary summary={summary} />
        <SaveButton disabled={!prompt || !completion || !summary || !image} handleSave={handleSave} />
      </div>
      <div className="flex-1 border-8 border-blue-500 h-1/2">
        <h2>Image</h2>
        <Image image={image} imagePrompt={imagePrompt} delay={0} />
      </div>
    </div>
  )
}

export default NewPage