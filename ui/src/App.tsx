import React, { useEffect, useState } from "react";
import Prompt from "./components/Prompt";
import Completion from "./components/Completion";
import Image from "./components/Image";
import Summary from "./components/Summary";
import SubmitButton from "./components/SubmitButton";
import Next from "./components/Next";
import Prev from "./components/Prev";
import SaveButton from "./components/SaveButton";
import AuthorList from "./components/AuthorList";
import PageList from "./components/PageList";
import StoryList from "./components/StoryList";

function App() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("Waiting for Response");
  const [authorsList, setAuthorsList] = useState([]);
  const [pages, setPages] = useState([]);
  const [stories, setStories] = useState([]);
  const [waitingForSummary, setWaitingForSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [image, setImage] = useState("");

  const handleChange = (event: any) => {
    setPrompt(event.target.value);
  }

  const handleSubmit = async (event: any) => {
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
  }

  useEffect(async () => {
    const authorsResponse = await fetch(`http://localhost:3001/authors`);
    setAuthorsList(await authorsResponse.json());
    authorsList.forEach(author => {
      fetch(`http://localhost:3001/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ authorId: author.id })
      }).then(response => response.json()).then(body => {
        setStories(body);
      });
    });
  }, []);

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
    <div className="w-screen h-screen flex">
      <div>
        <Prev />
        <AuthorList authors={authorsList} />
        <PageList pages={pages} />
        <StoryList stories={stories} />
      </div>
      <div className="flex-1 border-8 border-red-500 h-5/6">
        <h2>Prompt</h2>
        <Prompt prompt={prompt} handleChange={handleChange} />
        <h2>Submit</h2>
        <SubmitButton prompt={prompt} handleSubmit={handleSubmit} />
      </div>
      <div className="flex-1 border-8 border-blue-500 h-5/6">
        <h2>Image</h2>
        <Image image={image} imagePrompt={imagePrompt} />
      </div>
      <div className="flex-1 border-8 border-green-500 h-5/6">
        <h2>Response</h2>
        <Completion completion={completion} />
        <h2>Summary</h2>
        <Summary summary={summary} />
        <SaveButton handleSave={handleSave} />
      </div>
      <Next className="flex h-1/2" />
    </div>
  )
}

export default App;