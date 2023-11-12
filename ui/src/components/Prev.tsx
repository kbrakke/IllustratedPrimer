import { MdNavigateBefore } from 'react-icons/md'

interface PrevProps {
  handlePrev: React.MouseEventHandler<HTMLButtonElement>
}

const Prev = (props: PrevProps) => {
  const { handlePrev } = props;
  return (
    <button className="h-auto m-0 ml-16" onClick={handlePrev}><MdNavigateBefore size="32" /></button>
  )
}

export default Prev