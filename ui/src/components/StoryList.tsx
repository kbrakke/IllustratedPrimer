import { Story } from "../App"

interface StoryListProps {
  stories: Story[]
}

const StoryList = (props: StoryListProps) => {
  const { stories } = props
  return (
    <ul>
      {stories.map((story) => (
        <li key={story.id}>{story.title}<br />{story.authorId}</li>
      ))}
    </ul>
  )
}

export default StoryList