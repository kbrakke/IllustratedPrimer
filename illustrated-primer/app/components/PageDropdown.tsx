import { Page, Story } from "@prisma/client";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react"
import pino from 'pino';

const logger = pino();

const Icon = () => {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20">
      <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
    </svg>
  );
};

/* .dropdown-container {
  text-align: left;
  border: 1px solid #ccc;
  position: relative;
  border-radius: 5px;
}*/

export default function PageDropdown({ story }) {
  const pages = story.pages as unknown as Page[];
  const storyId = story.id;
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(pages[0]);
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => { setShowMenu(false); };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  });

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handlePageSwitch = (newPageId: string) => {
    const newPage = pages.find((page) => page.id === newPageId);
    setSelectedPage(newPage || null);
    setShowMenu(false);
    if (newPage) {
      navigate(`/codex/${storyId}/${newPage.id}`)
    }
  }

  const newPage = () => {
    setSelectedPage(null);
    setShowMenu(false);
    navigate(`/codex/${storyId}/new_page`)
  }

  return (
    <div className="relative inline-block text-left">
      <div onClick={handleInputClick} className="dropdown-input">
        {showMenu && <div className="absolute overflow-show bg-base-100">
          {pages.map((page) => (
            <button key={`${page.id}}`} onClick={() => { handlePageSwitch(page.id) }} className="btn btn-ghost text-left flex">
              {page.pageName}
            </button>
          ))}
          <button key={`new`} onClick={() => { newPage() }} className="btn btn-ghost text-left">
            New Page
          </button>
        </div>}
        <div className="dropdown-tools flex inline-block btn btn-ghost text-left">
          {selectedPage?.pageName}
          <Icon />
        </div>
      </div>
    </div>
  );
};
