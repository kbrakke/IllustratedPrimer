import React from 'react';

interface PageButtonProps {
  handleClick: React.MouseEventHandler<HTMLButtonElement>
  icon: React.ReactNode
  left: boolean
}

const PageButton = (props: PageButtonProps) => {
  const { handleClick, icon, left } = props;
  const rounding = left ? 'rounded-l-2xl rounded-r-md' : 'rounded-r-2xl rounded-l-md'
  return (
    <button className={`bg-orange-200 m-0 h-full w-20 shadow-lg ${rounding}`} onClick={handleClick}>{icon}</button>
  )
}


export default PageButton