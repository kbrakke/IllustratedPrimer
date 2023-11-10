import React from 'react'

const AuthorList = ({ authors }) => {
  return (
    <ul>
      {authors.map((author) => (
        <li key={author.id}>{author.name}  {author.email}</li>
      ))}
    </ul>
  )
}

export default AuthorList