import React from 'react';

interface ImageProps {
  image: string;
  imagePrompt: string;
}

const Image = (props: ImageProps) => {
  const { image, imagePrompt } = props;
  if (image !== "") {
    const b64Image = `data:image/png;base64,${image}`;
    return (
      <img src={b64Image} alt={imagePrompt} />
    )
  } else return null;
}

export default Image;