interface PageButtonProps {
  handleClick: React.MouseEventHandler<HTMLButtonElement>
  icon: React.ReactNode
  left: boolean
}

const PageButton = (props: PageButtonProps) => {
  const { handleClick, icon, left } = props;
  const rounding = left ? 'rounded-l-2xl' : 'rounded-r-2xl'
  return (
    <button className={`bg-orange-300 m-0 h-full w-12 shadow-lg ${rounding}`} onClick={handleClick}>{icon}</button>
  )
}


export default PageButton