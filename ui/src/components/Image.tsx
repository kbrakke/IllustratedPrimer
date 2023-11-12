import { isNil } from "lodash";

interface ImageProps {
  image: string;
  imagePrompt: string;
  delay: number;
  skipFade?: boolean;
}

const Image = (props: ImageProps) => {
  const { image, imagePrompt, delay, skipFade } = props;
  if (image !== "") {
    const b64Image = `data:image/png;base64,${image}`;
    const animateStyle = {
      animationDelay: `${delay}ms`
    }
    if (isNil(skipFade) || !skipFade) {
      return (
        <img key={imagePrompt.substring(0, 16)} className="animate-fade-down object-scale-down object-center w-full h-full" src={b64Image} alt={imagePrompt} />
      )
    }
    return (
      <img key={imagePrompt.substring(0, 16)} style={animateStyle} className="animate-fade-down object-scale-down object-center w-full h-full" src={b64Image} alt={imagePrompt} />
    )
  } else return null;
}

export default Image;