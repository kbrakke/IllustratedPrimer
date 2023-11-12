
interface SummaryProps {
  summary: string
}

const Summary = (props: SummaryProps) => {
  const { summary } = props
  return (
    <div>{summary}</div>
  )
}

export default Summary