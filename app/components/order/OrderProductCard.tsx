"use client";

import { useState } from "react";
import { Product } from "@/app/services/product.service";
import ImageZoom from "../ImageZoom";

interface OrderProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function OrderProductCard({ product, onClick }: OrderProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleCardClick = () => {
    onClick(product);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = product.images[currentImageIndex] || "/placeholder-image.png";
  const hasMultipleImages = product.images.length > 1;

  return (
    <div 
      className="card h-100 border-0 shadow-sm product-card"
      style={{ cursor: "pointer", transition: "all 0.3s" }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Imagem com Zoom e Setas */}
      <div className="position-relative" style={{ height: "250px", overflow: "hidden" }}>
        {product.images.length > 0 ? (
          <ImageZoom
            src={currentImage}
            alt={product.name}
            isHovering={isHovering}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
            <i className="bi bi-image" style={{ fontSize: "3rem", color: "#ccc" }}></i>
          </div>
        )}
        
        {/* Setas de Navegação - Aparecem só com múltiplas imagens e ao hover */}
        {hasMultipleImages && isHovering && (
          <>
            {/* Seta Esquerda */}
            <button
              className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow-sm"
              style={{
                width: "35px",
                height: "35px",
                padding: 0,
                marginLeft: "8px",
                opacity: 0.9,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={handlePrevImage}
              aria-label="Imagem anterior"
            >
              <i className="bi bi-chevron-left" style={{ fontSize: "1.2rem" }}></i>
            </button>

            {/* Seta Direita */}
            <button
              className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow-sm"
              style={{
                width: "35px",
                height: "35px",
                padding: 0,
                marginRight: "8px",
                opacity: 0.9,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={handleNextImage}
              aria-label="Próxima imagem"
            >
              <i className="bi bi-chevron-right" style={{ fontSize: "1.2rem" }}></i>
            </button>
          </>
        )}

        {/* Badge de Quantidade de Imagens */}
        {product.images.length > 1 && (
          <div
            className="position-absolute bottom-0 end-0 m-2 badge bg-dark"
            style={{ opacity: 0.8 }}
          >
            <i className="bi bi-image me-1"></i>
            {currentImageIndex + 1}/{product.images.length}
          </div>
        )}

        {/* Badge de Status */}
        {!product.isActive && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-danger">Inativo</span>
          </div>
        )}

        {/* Badge de Estoque Baixo */}
        {product.stockQuantity <= 10 && product.stockQuantity > 0 && (
          <div className="position-absolute top-0 start-0 m-2" style={{ marginTop: product.isActive ? "8px" : "40px" }}>
            <span className="badge bg-warning text-dark">Estoque Baixo</span>
          </div>
        )}

        {/* Badge de Sem Estoque */}
        {product.stockQuantity === 0 && (
          <div className="position-absolute top-0 start-0 m-2" style={{ marginTop: product.isActive ? "8px" : "40px" }}>
            <span className="badge bg-danger">Sem Estoque</span>
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="card-body">
        <h6 className="card-title mb-2" style={{ 
          overflow: "hidden", 
          textOverflow: "ellipsis", 
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          minHeight: "3rem"
        }}>
          {product.name}
        </h6>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="h5 mb-0 text-primary">
              € {product.price.toFixed(2)}
            </div>
          </div>
          <div className="text-end">
            <small className="text-muted">
              <i className="bi bi-box-seam me-1"></i>
              {product.stockQuantity} un.
            </small>
          </div>
        </div>

        {/* Descrição resumida */}
        {product.description && (
          <p className="card-text text-muted small mb-0" style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical"
          }}>
            {product.description}
          </p>
        )}
      </div>

      <style jsx>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
