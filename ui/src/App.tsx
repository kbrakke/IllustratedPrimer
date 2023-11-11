import React, { MouseEventHandler, useEffect, useState } from "react";
import Prompt from "./components/Prompt";
import Completion from "./components/Completion";
import Image from "./components/Image";
import Summary from "./components/Summary";
import Next from "./components/Next";
import Prev from "./components/Prev";
import SaveButton from "./components/SaveButton";
import DebugCurrentState from "./components/DebugCurrentState";
import CompletedPage from "./components/CompletedPage";
import NewPage from "./components/NewPage";
import { set } from "lodash";


interface Author {
  id: string;
  name: string;
  email: string;
  stories?: Story[];
}

export interface Page {
  id: string;
  storyId: string;
  prompt: string;
  completion: string;
  summary: string;
  image: string;
  number: number;
  story?: Story;
}

interface Story {
  id: number;
  title: string;
  authorId: string;
  author?: Author;
  Pages?: Page[];
}

export interface CurrentState {
  page: Page;
  author: Author;
  story: Story;
}

function App() {
  const [authorsList, setAuthorsList] = useState<Author[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<CurrentState>({
    page: {
      id: "",
      storyId: "",
      prompt: "",
      completion: "",
      summary: "",
      image: "",
      number: 0,
    },
    author: {
      id: "",
      name: "",
      email: "",
    },
    story: {
      id: 0,
      title: "",
      authorId: "",
    }
  });
  const [currentLeft, setCurrentLeft] = useState<boolean>(true);

  useEffect(() => {
    async function fetchInitialInfo() {
      const authorsResponse = await fetch(`http://localhost:3001/authors`);
      const authorsJson = await authorsResponse.json();
      setAuthorsList(authorsJson);
      const authorStories = await fetch(`http://localhost:3001/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ authorId: authorsJson[0].id })
      });
      const storiesJson = await authorStories.json()
      setStories(storiesJson);
      const storyPages = await fetch(`http://localhost:3001/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ storyId: storiesJson[0].id })
      });
      const pagesJson = await storyPages.json();
      setPages(pagesJson);
      setCurrentState({
        page: pagesJson[0],
        author: authorsJson[0],
        story: storiesJson[0],
      });
      setCurrentLeft(pagesJson[0].number % 2 === 1);
      setHasNext(!!pagesJson[1]);
    }
    fetchInitialInfo();
  }, []);

  useEffect(() => {
    setCurrentLeft(currentState.page.number % 2 === 1);
    console.log(currentState.page.number)
    setHasNext(!!pages[currentState.page.number]);
  }, [currentState]);

  const handleNext = async () => {
    console.log("next");
    if (currentState.page.number === pages.length) return;
    const nextPage = pages[currentState.page.number];
    setCurrentState({
      page: nextPage,
      author: currentState.author,
      story: currentState.story,
    });
  }
  const handlePrev = async () => {
    console.log("prev");
    if (currentState.page.number === 1) return;
    const prevPage = pages[currentState.page.number - 2];
    setCurrentState({
      page: prevPage,
      author: currentState.author,
      story: currentState.story,
    });
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-1">
        <Prev handlePrev={handlePrev} />
        <DebugCurrentState currentState={currentState} />
      </div>
      {!!pages[currentState.page.number] ? <><CompletedPage page={currentState.page} /><CompletedPage page={pages[currentState.page.number]} /></> : <><CompletedPage page={currentState.page} /><NewPage /></>}
      <Next handleNext={handleNext} />
    </div>
  )
}

export default App;