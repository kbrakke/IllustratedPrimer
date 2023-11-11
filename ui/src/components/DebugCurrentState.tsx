import React from 'react'
import { CurrentState } from '../App'
import { isEmpty } from 'lodash'

interface DebugCurrentStateProps {
  currentState?: CurrentState
}

const DebugCurrentState = (props: DebugCurrentStateProps) => {
  const currentState = props.currentState
  if (!currentState || isEmpty(currentState)) {
    return (<div>Loading...</div>)
  }
  return (
    <div>
      <h1>Current State</h1>
      <h2>Author</h2>
      <ul className='list-disc list-inside'>
        <li>ID: {currentState?.author.id}</li>
        <li>Name: {currentState?.author.name}</li>
        <li>Email: {currentState?.author.email}</li>
      </ul>
      <h2>Story</h2>
      <ul className='list-disc list-inside'>
        <li>ID: {currentState?.story.id}</li>
        <li>Title: {currentState?.story.title}</li>
        <li>Author ID: {currentState?.story.authorId}</li>
      </ul>
      <h2>Page</h2>
      <ul className='list-disc list-inside'>
        <li>ID: {currentState?.page.id}</li>
        <li>Story ID: {currentState?.page.storyId}</li>
        <li>Prompt: {currentState?.page.prompt}</li>
        <li>Completion: {currentState?.page.completion}</li>
        <li>Summary: {currentState?.page.summary}</li>
        <li>Image: {currentState?.page.image}</li>
        <li>Number: {currentState?.page.number}</li>
      </ul>
    </div>
  )
}

export default DebugCurrentState;
