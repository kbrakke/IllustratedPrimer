import { MdNavigateNext } from 'react-icons/md'

interface NextProps {
  handleNext: React.MouseEventHandler<HTMLButtonElement>
}

const Next = (props: NextProps) => {
  const { handleNext } = props;
  return (
    <button className="bg-orange-200" onClick={handleNext}><MdNavigateNext size="32" /></button>
  )
}


export default Next