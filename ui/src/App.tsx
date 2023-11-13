import { useEffect, useRef, useState } from "react";
import DebugCurrentState from "./components/DebugCurrentState";
import CompletedPage from "./components/CompletedPage";
import NewPage from "./components/NewPage";
import SideBar from "./components/SideBar";
import PageButton from "./components/PageButton";
import { isEmpty, isNil } from "lodash";
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md'
import { find } from 'lodash';

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
  const [canPlayAudio, setCanPlayAudio] = useState<boolean>(true);
  const audioRef = useRef(new Audio());
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

  const playAudio = (e: React.MouseEvent<HTMLElement>) => {
    console.log("play audio");
    console.log(canPlayAudio);
    if (!canPlayAudio) return;
    const pageId: string = e.currentTarget.id.substring(0, e.currentTarget.id.length - 6);
    console.log(pageId);
    const pageForAudio = find(pages, (page) => page.id === pageId);
    console.log(pageForAudio);
    const startAudioStream = async () => {
      const response = await fetch(`http://localhost:3001/ai/tts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pageId: pageForAudio?.id, prompt: `${pageForAudio?.prompt} ${pageForAudio?.completion}` })
      });
      const blob = await response.blob();
      var url = window.URL.createObjectURL(blob)
      audioRef.current.src = url;
      audioRef.current.play();
    }
    setCanPlayAudio(false);
    startAudioStream();
    setCanPlayAudio(true);
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
            ? <><CompletedPage
              page={currentState.page}
              initialDelay={0}
              playAudio={playAudio}
            />
              <CompletedPage
                page={pages[currentState.page.number]}
                initialDelay={8000}
                playAudio={playAudio}
              /></>
            : <><CompletedPage
              page={currentState.page}
              initialDelay={0}
              playAudio={playAudio} />
              <NewPage pageCount={pages.length} currentState={currentState} setCurrentState={setCurrentState} />
            </>
        }
        <PageButton handleClick={handleNext} icon={<MdNavigateNext size="32" />} left={false} />
      </div>
    </div>
  )
}

export default App;