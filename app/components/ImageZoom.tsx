"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  isHovering: boolean;
}

export default function ImageZoom({ src, alt, isHovering }: ImageZoomProps) {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  return (
    <div
      ref={imageRef}
      className="position-relative w-100 h-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ overflow: "hidden" }}
    >
      {/* Imagem normal */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transition: "transform 0.3s ease"
        }}
      />

      {/* Overlay de zoom (aparece ao hover) */}
      {showZoom && isHovering && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: "200%",
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
            opacity: 0.95
          }}
        />
      )}
    </div>
  );
}
