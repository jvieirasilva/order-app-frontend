"use client";

import { useState } from "react";
import { Product } from "@/app/services/product.service";
import ImageZoom from "./ImageZoom";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({ product, onClick, onEdit, onDelete }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleCardClick = () => {
    onClick(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o modal
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o modal
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
        
        {/* Botões de Ação - Canto Superior Direito */}
        {isHovering && (onEdit || onDelete) && (
          <div
            className="position-absolute top-0 end-0 m-2"
            style={{ zIndex: 20 }}
          >
            <div className="d-flex gap-2">
              {/* Botão Editar */}
              {onEdit && (
                <button
                  className="btn btn-warning btn-sm shadow"
                  onClick={handleEdit}
                  title="Editar produto"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <i className="bi bi-pencil-fill"></i>
                </button>
              )}

              {/* Botão Deletar */}
              {onDelete && (
                <button
                  className="btn btn-danger btn-sm shadow"
                  onClick={handleDelete}
                  title="Deletar produto"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              )}
            </div>
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

        {/* Indicador de múltiplas imagens */}
        {hasMultipleImages && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2">
            <div className="d-flex gap-1">
              {product.images.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className="rounded-circle"
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: index === currentImageIndex ? "#3483fa" : "#fff",
                    opacity: index === currentImageIndex ? 1 : 0.6,
                    cursor: "pointer"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Badge de estoque */}
        {product.stockQuantity > 0 && product.stockQuantity < 10 && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-warning text-dark">
              Apenas {product.stockQuantity} restantes
            </span>
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="card-body d-flex flex-column">
        <h6 className="card-title text-truncate mb-2" title={product.name}>
          {product.name}
        </h6>
        
        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="h5 mb-0 text-dark fw-bold">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          
          {product.stockQuantity > 0 ? (
            <small className="text-success">
              <i className="bi bi-check-circle-fill me-1"></i>
              Em estoque
            </small>
          ) : (
            <small className="text-danger">
              <i className="bi bi-x-circle-fill me-1"></i>
              Sem estoque
            </small>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
        }
        
        .btn:hover {
          opacity: 1 !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
