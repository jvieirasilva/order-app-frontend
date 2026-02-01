"use client";

import { useState, useEffect } from "react";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  productName?: string;
}

export default function ImageLightbox({ images, currentIndex, onClose, productName }: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    // Bloqueia scroll do body quando lightbox está aberto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Navegação com teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
      style={{ zIndex: 9999 }}
    >
      {/* Header */}
      <div
        className="position-absolute top-0 start-0 w-100 d-flex justify-content-between align-items-center p-3"
        style={{ zIndex: 10000, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      >
        <div className="text-white d-flex align-items-center gap-3">
          <button
            className="btn btn-link text-white text-decoration-none p-0"
            onClick={onClose}
          >
            <i className="bi bi-arrow-left" style={{ fontSize: "1.5rem" }}></i>
          </button>
          <span className="fs-6">{productName || "Imagem do produto"}</span>
        </div>
        <button
          className="btn btn-link text-white text-decoration-none p-0"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" style={{ fontSize: "1.5rem" }}></i>
        </button>
      </div>

      {/* Contador de imagens */}
      <div
        className="position-absolute top-0 start-50 translate-middle-x mt-5 pt-3 text-white"
        style={{ zIndex: 10000 }}
      >
        <span className="badge bg-dark bg-opacity-75 fs-6 px-3 py-2">
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {/* Imagem principal */}
      <div
        className="w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ paddingTop: "80px", paddingBottom: "120px" }}
      >
        <img
          src={images[activeIndex]}
          alt={`${productName || "Produto"} - ${activeIndex + 1}`}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            objectFit: "contain",
            userSelect: "none"
          }}
          draggable={false}
        />
      </div>

      {/* Setas de navegação */}
      {images.length > 1 && (
        <>
          {/* Seta Esquerda */}
          <button
            className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow ms-3"
            style={{ width: "60px", height: "60px", zIndex: 10000 }}
            onClick={handlePrev}
          >
            <i className="bi bi-chevron-left" style={{ fontSize: "1.5rem" }}></i>
          </button>

          {/* Seta Direita */}
          <button
            className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow me-3"
            style={{ width: "60px", height: "60px", zIndex: 10000 }}
            onClick={handleNext}
          >
            <i className="bi bi-chevron-right" style={{ fontSize: "1.5rem" }}></i>
          </button>
        </>
      )}

      {/* Thumbnails na parte inferior */}
      {images.length > 1 && (
        <div
          className="position-absolute bottom-0 start-0 w-100 p-3"
          style={{
            zIndex: 10000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            overflowX: "auto",
            whiteSpace: "nowrap"
          }}
        >
          <div className="d-flex gap-2 justify-content-center">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleThumbnailClick(index)}
                style={{
                  minWidth: "80px",
                  width: "80px",
                  height: "80px",
                  cursor: "pointer",
                  border: index === activeIndex ? "3px solid #fff" : "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  opacity: index === activeIndex ? 1 : 0.6,
                  transition: "all 0.2s ease"
                }}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-100 h-100 object-fit-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
