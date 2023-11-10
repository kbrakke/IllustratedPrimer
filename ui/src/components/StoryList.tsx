import React from 'react'

const StoryList = ({ stories }) => {
  return (
    <ul>
      {stories.map((story) => (
        <li key={story.id}>{story.title}<br />{story.author}</li>
      ))}
    </ul>
  )
}

export default StoryList