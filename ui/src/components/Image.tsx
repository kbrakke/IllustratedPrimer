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
    if (isNil(skipFade) || skipFade) {
      return (
        <span className="inline-flex h-1/2 m-4">
          <img key={imagePrompt.substring(0, 16)} className="animate-fade-down object-scale-down object-center shrink border-8 border-double" src={b64Image} alt={imagePrompt} />
        </span>
      )
    }
    return (
      <span className="inline-flex h-1/2 m-4">
        <img key={imagePrompt.substring(0, 16)} style={animateStyle} className="animate-fade-down object-scale-down object-center shrink border-4 border-double" src={b64Image} alt={imagePrompt} />
      </span>
    )
  } else return null;
}

export default Image;