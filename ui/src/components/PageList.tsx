import React from 'react'

const PageList = ({ pages }) => {
  return (
    <ul>
      {pages.map((page) => (
        <li key={page.id}>{page.summary}<br />{page.image}</li>
      ))}
    </ul>
  )
}

export default PageList