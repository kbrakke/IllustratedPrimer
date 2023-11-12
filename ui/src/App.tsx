import React, { useEffect, useState } from "react";
import Next from "./components/Next";
import Prev from "./components/Prev";
import DebugCurrentState from "./components/DebugCurrentState";
import CompletedPage from "./components/CompletedPage";
import NewPage from "./components/NewPage";
import { isEmpty, isNil } from "lodash";


export interface Author {
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

export interface Story {
  id: string;
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
      id: "",
      title: "",
      authorId: "",
    }
  });

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
      setHasNext(!!pagesJson[1]);
    }
    fetchInitialInfo();
  }, []);

  useEffect(() => {
    async function updatePages() {
      const storyPages = await fetch(`http://localhost:3001/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ storyId: currentState.story.id })
      });
      const pagesJson = await storyPages.json();
      setPages(pagesJson);
    }
    if (currentState.story.id === "" || currentState.story.id === undefined) return;
    updatePages();
    console.log(pages);
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
      <Prev handlePrev={handlePrev} />
      {import.meta.env.VITE_DEBUG && <div className="flex-1">
        <DebugCurrentState currentState={currentState} />
      </div>}
      {isEmpty(pages)
        ? <><NewPage pageCount={pages.length} currentState={currentState} setCurrentState={setCurrentState} /></>
        : !isNil(pages[currentState?.page?.number])
          ? <><CompletedPage page={currentState.page} /><CompletedPage page={pages[currentState.page.number]} /></>
          : <><CompletedPage page={currentState.page} /><NewPage pageCount={pages.length} currentState={currentState} setCurrentState={setCurrentState} /></>
      }
      <Next handleNext={handleNext} />
    </div>
  )
}

export default App;