import { isNil } from "lodash";

interface FadeInTextProps {
  text: string;
  initialDelay: number;
  skipFade?: boolean;
}

const FadeInText = (props: FadeInTextProps) => {
  const { text, initialDelay, skipFade } = props
  if (isNil(skipFade) || skipFade) {
    return (<span className={`animate-fade font-storybook text-xl`}>{text}</span>)
  }
  const words = text.split(' ');
  const timePerWord = 4000 / words.length;
  return (
    <div className="inline-block h-1/2">
      {words.map((word, index) => {
        const animateStyle = {
          animationDelay: `${(index * timePerWord) + initialDelay || 0}ms`
        }
        return (<span key={word + index} style={animateStyle} className={`animate-fade font-storybook text-xl`}>{word} </span>)
      })}
    </div>
  )
}

export default FadeInText