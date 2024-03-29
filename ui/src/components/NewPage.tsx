import { MouseEventHandler, useEffect, useState } from 'react'
import Prompt from './Prompt'
import Summary from './Summary'
import SaveButton from './SaveButton'
import Image from './Image'
import FadeInText from './FadeInText'
import * as _ from 'lodash'
import { CurrentState } from '../App'


interface NewPageProps {
  pageCount: number;
  currentState: CurrentState;
  setCurrentState: React.Dispatch<React.SetStateAction<CurrentState>>;
}

const NewPage = (props: NewPageProps) => {
  const { pageCount, currentState, setCurrentState } = props;
  const [newPageId, setNewPageId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("");
  const [, setWaitingForSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [image, setImage] = useState("");
  const [waitngForImage, setWaitingForImage] = useState(false);

  const handleChange = (event: any) => {
    setPrompt(event.target.value);
  }

  const resetFields = () => {
    setCurrentState({
      page: {
        id: newPageId,
        storyId: currentState.story.id,
        prompt: "prompt",
        completion: "completion",
        summary: "summary",
        image: "image",
        number: pageCount + 1,
      },
      story: currentState.story,
      author: currentState.author
    })
    setNewPageId("");
    setPrompt("");
    setCompletion("");
    setSummary("");
    setImage("");
  }


  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    const response = await fetch(`http://localhost:3001/ai/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });
    const body = await response.json();
    setCompletion(body.text);
  }

  useEffect(() => {
    setWaitingForSummary(true);
    if (completion === "") return;
    const fetchSummary = async () => {
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
    }
    fetchSummary();
    setWaitingForSummary(false);
  }, [completion]);

  useEffect(() => {
    if (image === "") return;
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

  }, [image]);

  useEffect(() => {
    if (imagePrompt === "") return;
    setWaitingForImage(true);
    const fetchImage = async () => {
      const imageResponse = await fetch(`http://localhost:3001/ai/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      const imageJson = await imageResponse.json();
      setImage(imageJson.b64_json);
      setWaitingForImage(false);
    };
    fetchImage();
  }, [imagePrompt]);

  return (
    <div className="flex-1 border-8 bg-orange-200 text-center h-full">
      <div className="flex-1 m-4 h-1/3 box-border">
        <Prompt prompt={prompt} handleChange={handleChange} handleSubmit={handleSubmit} />
        <FadeInText text={completion} initialDelay={0} />
        <Summary summary={summary} />
      </div>
      {waitngForImage
        ? <div className="flex m-4 h-1/2 box-border content-center shadow-md bg-orange-300 animate-fade animate-infinite animate-duration-[2000ms] animate-ease-in-out blur-xl">
          <Image image={image} imagePrompt={imagePrompt} delay={0} />
        </div>
        : <div className="flex m-4 h-1/2 box-border content-center shadow-md">
          <Image image={image} imagePrompt={imagePrompt} delay={0} />
        </div>}
    </div>
  )
}

export default NewPage