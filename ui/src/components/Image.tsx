import React from 'react';

interface ImageProps {
  image: string;
  imagePrompt: string;
}

const Image = (props: ImageProps) => {
  const { image, imagePrompt } = props;
  if (image !== "") {
    return (
      <img src={image} alt={imagePrompt} />
    )
  } else return null;
}

export default Image;