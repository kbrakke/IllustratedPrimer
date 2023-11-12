interface CompletionProps {
  completion: string;
}

const Completion = (props: CompletionProps) => {
  const { completion } = props;
  return (
    <p>{completion}</p>
  )
}

export default Completion;