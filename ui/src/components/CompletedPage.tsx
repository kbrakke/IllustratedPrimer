import React from 'react'
import Image from './Image'
import { Page } from '../App';

interface CompletedPageProps {
  page: Page;
}


const CompletedPage = (props: CompletedPageProps) => {
  const { page } = props
  return (
    <div className="flex-1 border-8 border-red-500 h-5/6">
      <div className="flex-1 border-8 border-green-500 h-1/6">
        <h2>Prompt</h2>
        {page.prompt}
      </div>
      <div className="flex-1 border-8 border-green-500 h-1/3">
        <h2>Response</h2>
        {page.completion}
      </div>
      <div className="flex-1 border-8 border-blue-500 h-3/6">
        <h2>Image</h2>
        <Image image={page.image} imagePrompt={page.summary} />
      </div>
    </div>
  )
}

export default CompletedPage