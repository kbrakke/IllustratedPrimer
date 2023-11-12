interface ImageProps {
  image: string;
  imagePrompt: string;
  delay: number;
}

const Image = (props: ImageProps) => {
  const { image, imagePrompt, delay } = props;
  if (image !== "") {
    const b64Image = `data:image/png;base64,${image}`;
    const animateStyle = {
      animationDelay: `${delay}ms`
    }
    return (
      <img key={imagePrompt} style={animateStyle} className="animate-fade-down" src={b64Image} alt={imagePrompt} />
    )
  } else return null;
}

export default Image;