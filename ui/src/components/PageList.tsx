import { Page } from "../App"

interface PageListProps {
  pages: Page[]
}

const PageList = (props: PageListProps) => {
  const { pages } = props
  return (
    <ul>
      {pages.map((page) => (
        <li key={page.id}>{page.summary}<br />{page.image}</li>
      ))}
    </ul>
  )
}

export default PageList