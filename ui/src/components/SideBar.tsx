import { ReactElement } from 'react'
import { GiBookmarklet } from 'react-icons/gi'
import { BsFilePersonFill } from 'react-icons/bs'
import { RiFilePaper2Line } from 'react-icons/ri'

const SideBar = () => {
  return (
    <div className='fixed top-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow'>
      <SideBarIcon icon={<BsFilePersonFill size="32" />} text="Author" />
      <SideBarIcon icon={<GiBookmarklet size="32" />} text="Stories" />
      <SideBarIcon icon={<RiFilePaper2Line size="32" />} text="Pages" />
    </div>
  )
}

const SideBarIcon = (props: { icon: ReactElement, text: string }) => {
  const { icon, text } = props
  return (
    <div className='sidebar-icon group'>
      {icon}
      <span className='sidebar-tooltip group-hover:scale-100'>
        {text}
      </span>
    </div>
  )
}


export default SideBar