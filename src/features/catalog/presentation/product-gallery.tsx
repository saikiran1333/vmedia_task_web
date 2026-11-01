"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: { src: string; alt: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const current = images[index];

  return (
    <div className="tg-gallery">
      <div className="tg-gallery-main">
        {current && !failed[index] ? (
          <img src={current.src} alt={current.alt} onError={() => setFailed((currentFailed) => ({ ...currentFailed, [index]: true }))} />
        ) : (
          <span className="tg-image-fallback">Image unavailable</span>
        )}
      </div>
      {images.length > 1 ? (
        <div className="tg-thumbs" role="list">
          {images.map((image, imageIndex) => (
            <button
              key={`${image.src}-${imageIndex}`}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`Show image ${imageIndex + 1} of ${name}`}
              aria-current={imageIndex === index ? "true" : undefined}
            >
              {failed[imageIndex] ? <span className="tg-image-fallback">Image unavailable</span> : <img src={image.src} alt="" />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
