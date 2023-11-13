import Image from './Image'
import { Page } from '../App';
import FadeInText from './FadeInText';
import { HiOutlineSpeakerWave } from 'react-icons/hi2';
import { MouseEventHandler } from 'react';

interface CompletedPageProps {
  page: Page;
  initialDelay: number;
  canPlayAudio: boolean;
  audio: HTMLAudioElement;
  playAudio: MouseEventHandler<HTMLButtonElement>;
  setCanPlayAudio: (canPlayAudio: boolean) => void;
}


const CompletedPage = (props: CompletedPageProps) => {
  const { page, initialDelay, canPlayAudio, playAudio, setCanPlayAudio } = props
  return (
    <div className="flex-1 border-2 mb-4 bg-orange-200 shadow-lg h-full" key={page.id}>
      <div className="flex-1 m-4 h-1/3 box-border relative">
        <button id={page.id + '-audio'} className='absolute right-0 top-0' onClick={playAudio}><HiOutlineSpeakerWave /></button>
        <p className='m-2'><FadeInText text={page.prompt} initialDelay={initialDelay} /></p>
        <p className='m-2'><FadeInText text={page.completion} initialDelay={initialDelay + 4000} /></p>
      </div>
      <div className="w-full m-4 h-1/2">
        <Image image={page.image} imagePrompt={page.summary} delay={initialDelay + 7500} />
      </div>
      <div className="flex-1 m-4 h-1/6 box-border">
      </div>
    </div>
  )
}

export default CompletedPage