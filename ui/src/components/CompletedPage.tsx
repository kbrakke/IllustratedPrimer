import Image from './Image'
import { Page } from '../App';
import FadeInText from './FadeInText';

interface CompletedPageProps {
  page: Page;
  initialDelay: number;
}


const CompletedPage = (props: CompletedPageProps) => {
  const { page, initialDelay } = props
  return (
    <div className="flex-1 border-2 mb-4 bg-orange-200 shadow-lg h-screen" key={page.id}>
      <div className="flex-1 m-4 h-2/6 box-border shadow-md">
        <p className='m-2'><FadeInText text={page.prompt} initialDelay={initialDelay} /></p>
        <p className='m-2'><FadeInText text={page.completion} initialDelay={initialDelay + 4000} /></p>
      </div>
      <div className="flex m-4 h-1/2 box-border content-center shadow-md">
        <Image image={page.image} imagePrompt={page.summary} delay={initialDelay + 7500} />
      </div>
    </div>
  )
}

export default CompletedPage