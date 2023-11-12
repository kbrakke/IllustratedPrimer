import { useEffect, useState } from "react";
import Next from "./components/Next";
import Prev from "./components/Prev";
import DebugCurrentState from "./components/DebugCurrentState";
import CompletedPage from "./components/CompletedPage";
import NewPage from "./components/NewPage";
import SideBar from "./components/SideBar";
import PageButton from "./components/PageButton";
import { isEmpty, isNil } from "lodash";
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md'

const debug: boolean = import.meta.env.VITE_DEBUG === "true";

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
  const [, setAuthorsList] = useState<Author[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [, setStories] = useState<Story[]>([]);
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
  }, [currentState]);

  const handleNext = async () => {
    if (currentState.page.number === pages.length) return;
    const nextPage = pages[currentState.page.number];
    setCurrentState({
      page: nextPage,
      author: currentState.author,
      story: currentState.story,
    });
  }

  const handlePrev = async () => {
    if (currentState.page.number === 1) return;
    const prevPage = pages[currentState.page.number - 2];
    setCurrentState({
      page: prevPage,
      author: currentState.author,
      story: currentState.story,
    });
  }

  return (
    <div className="w-screen screen flex h-screen">
      <SideBar />
      <div className="flex h-5/6 shadow-xl0">
        <div className="ml-16"><PageButton handleClick={handlePrev} icon={<MdNavigateBefore size="32" />} left={true} /></div>
        {debug && <div className="flex-1"><DebugCurrentState currentState={currentState} /></div>}
        {isEmpty(pages)
          ? <div className="w-full"><NewPage pageCount={pages.length} currentState={currentState} setCurrentState={setCurrentState} /></div>
          : !isNil(pages[currentState?.page?.number])
            ? <><CompletedPage page={currentState.page} initialDelay={0} /><CompletedPage page={pages[currentState.page.number]} initialDelay={8000} /></>
            : <><CompletedPage page={currentState.page} initialDelay={0} /><NewPage pageCount={pages.length} currentState={currentState} setCurrentState={setCurrentState} /></>
        }
        <PageButton handleClick={handleNext} icon={<MdNavigateNext size="32" />} left={false} />
      </div>
    </div>
  )
}

export default App;