import Image from './Image'
import { Page } from '../App';
import FadeInText from './FadeInText';
import { HiOutlineSpeakerWave } from 'react-icons/hi2';
import { MouseEventHandler } from 'react';

interface CompletedPageProps {
  page: Page;
  initialDelay: number;
  playAudio: MouseEventHandler<HTMLButtonElement>;
}


const CompletedPage = (props: CompletedPageProps) => {
  const { page, initialDelay, playAudio } = props
  return (
    <div className="flex-1 border-2 mb-4 bg-orange-200 shadow-lg h-full" key={page.id}>
      <div className="flex-1 m-4 h-1/3 box-border relative">
        <button id={page.id + '-audio'} className='absolute right-0 top-0' onClick={playAudio}><HiOutlineSpeakerWave /></button>
        <FadeInText text={page.prompt} initialDelay={initialDelay} skipFade={true} />
        <FadeInText text={page.completion} initialDelay={initialDelay + 4000} skipFade={true} />
      </div>
      <div className="w-full m-4 h-1/2 shrink">
        <Image image={page.image} imagePrompt={page.summary} delay={initialDelay + 7500} skipFade={true} />
      </div>
    </div>
  )
}

export default CompletedPage