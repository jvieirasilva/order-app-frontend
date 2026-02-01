"use client";

import { useState, useRef, MouseEvent } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  isHovering: boolean;
  onImageClick?: () => void;  // Callback para abrir lightbox
}

export default function ImageZoom({ src, alt, isHovering, onImageClick }: ImageZoomProps) {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleClick = () => {
    if (onImageClick) {
      onImageClick();
    }
  };

  return (
    <div
      ref={imageRef}
      className="position-relative w-100 h-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ overflow: "visible", cursor: showZoom && isHovering ? "pointer" : "default" }}
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

      {/* Indicador de área (cursor lens) */}
      {showZoom && isHovering && (
        <div
          className="position-absolute border border-2 border-primary"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            width: "100px",
            height: "100px",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            backgroundColor: "rgba(52, 131, 250, 0.1)",
            zIndex: 5
          }}
        />
      )}

      {/* Popup de zoom flutuante estilo Mercado Livre */}
      {showZoom && isHovering && (
        <div
          className="position-absolute bg-white border border-2 rounded shadow-lg"
          style={{
            left: "calc(100% + 15px)", // Aparece à direita da imagem
            top: "0",
            width: "450px",
            height: "450px",
            backgroundImage: `url(${src})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: "250%", // Zoom maior
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
            zIndex: 1000,
            opacity: 1,
            transition: "opacity 0.2s ease",
            cursor: "pointer"
          }}
        />
      )}

      {/* Ícone de expandir (aparece ao hover) */}
      {showZoom && isHovering && (
        <div
          className="position-absolute bottom-0 end-0 m-3 bg-dark bg-opacity-75 text-white rounded px-2 py-1"
          style={{ zIndex: 6, fontSize: "0.85rem", pointerEvents: "none" }}
        >
          <i className="bi bi-arrows-fullscreen me-1"></i>
          Clique para ampliar
        </div>
      )}
    </div>
  );
}
