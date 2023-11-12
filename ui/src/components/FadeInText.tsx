interface FadeInTextProps {
  text: string;
  initialDelay: number;
}

const FadeInText = (props: FadeInTextProps) => {
  const { text, initialDelay } = props
  const words = text.split(' ');
  const timePerWord = 4000 / words.length;
  return (
    <div className="inline-block">
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