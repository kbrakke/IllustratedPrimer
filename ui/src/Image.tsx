import React from 'react';

function Image({ image, imagePrompt}) {
  if (image !==  "") {
    return (
      <img src={image} alt={imagePrompt} />
    )
  } else return null;
}

export default Image;