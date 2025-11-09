import { useState } from 'react';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,...';

export function ImageWithFallback({ src, alt, className, ...rest }) {
  const [didError, setDidError] = useState(false);

  const handleError = () => setDidError(true);

  if (didError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || ''}`}>
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} {...rest} onError={handleError} />;
}
