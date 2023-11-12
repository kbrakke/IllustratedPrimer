import { Author } from "../App"

interface AuthorListProps {
  authors: Author[]
}


const AuthorList = (props: AuthorListProps) => {
  const { authors } = props;
  return (
    <ul>
      {authors.map((author) => (
        <li key={author.id}>{author.name}  {author.email}</li>
      ))}
    </ul>
  )
}

export default AuthorList