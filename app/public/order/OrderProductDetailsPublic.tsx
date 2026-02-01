"use client";

import { useState, useEffect } from "react";
import { Product } from "@/app/services/product.service";
import ImageZoom from "./ImageZoom";
import ImageLightbox from "./ImageLightbox";

interface OrderProductDetailsProps {
  product: Product | null;
  onClose: () => void;
}

export default function OrderProductDetailsPublic({ product, onClose }: OrderProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isImageHovering, setIsImageHovering] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(0);
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product]);

  // ✅ PROTEÇÃO: Se product for null, não renderiza nada
  if (!product) return null;

  // ✅ PROTEÇÃO: Garante que images seja sempre um array
  const productImages = product.images || [];
  const hasImages = productImages.length > 0;
  const hasMultipleImages = productImages.length > 1;
  const currentImage = productImages[currentImageIndex] || "/placeholder-image.png";

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  // ✅ FUNÇÃO PARA ABRIR LIGHTBOX
  const handleImageClick = () => {
    if (hasImages) {
      setShowLightbox(true);
    }
  };

  // ✅ FUNÇÃO PARA FECHAR LIGHTBOX
  const handleCloseLightbox = () => {
    setShowLightbox(false);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    const maxStock = product.stockQuantity || 0;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxStock = product.stockQuantity || 0;
    if (!isNaN(value) && value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  // ✅ VERSÃO PÚBLICA - Redireciona para login
  const handleBuyNow = () => {
    alert("Por favor, faça login para comprar produtos.");
    window.location.href = "/login";
  };

  // ✅ VERSÃO PÚBLICA - Redireciona para login
  const handleAddToCart = () => {
    alert("Por favor, faça login para adicionar produtos ao carrinho.");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 overflow-auto"
        style={{ zIndex: 1051 }}
        onClick={onClose}
      >
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div
                className="bg-white rounded-3 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="modal-header border-bottom">
                  <h5 className="modal-title">
                    <i className="bi bi-box-seam me-2"></i>
                    Detalhes do Produto
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Fechar"
                  />
                </div>

                {/* Body */}
                <div className="modal-body p-4">
                  <div className="row">
                    {/* Galeria de Imagens com Zoom */}
                    <div className="col-lg-6 mb-4 mb-lg-0">
                      {/* Imagem Principal com Zoom */}
                      <div 
                        className="position-relative mb-3" 
                        style={{ height: "400px" }}
                        onMouseEnter={() => setIsImageHovering(true)}
                        onMouseLeave={() => setIsImageHovering(false)}
                      >
                        {hasImages ? (
                          <ImageZoom
                            src={currentImage}
                            alt={product.name || "Produto"}
                            isHovering={isImageHovering}
                            onImageClick={handleImageClick}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
                            <i className="bi bi-image" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                          </div>
                        )}

                        {/* Setas de Navegação */}
                        {hasMultipleImages && (
                          <>
                            <button
                              className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow ms-2"
                              style={{ width: "45px", height: "45px", zIndex: 10 }}
                              onClick={handlePrevImage}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            <button
                              className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow me-2"
                              style={{ width: "45px", height: "45px", zIndex: 10 }}
                              onClick={handleNextImage}
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>

                            {/* Contador */}
                            <div
                              className="position-absolute bottom-0 end-0 badge bg-dark m-3"
                              style={{ fontSize: "0.9rem", zIndex: 10 }}
                            >
                              {currentImageIndex + 1} / {productImages.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {hasMultipleImages && (
                        <div className="d-flex gap-2 overflow-auto pb-2">
                          {productImages.map((image, index) => (
                            <div
                              key={index}
                              onClick={() => handleThumbnailClick(index)}
                              style={{
                                minWidth: "80px",
                                width: "80px",
                                height: "80px",
                                cursor: "pointer",
                                border: index === currentImageIndex ? "3px solid #3483fa" : "2px solid #e0e0e0",
                                borderRadius: "8px",
                                overflow: "hidden",
                                opacity: index === currentImageIndex ? 1 : 0.6,
                                transform: index === currentImageIndex ? "scale(1)" : "scale(0.95)",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <img
                                src={image}
                                alt={`${product.name || "Produto"} - ${index + 1}`}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="col-lg-6">
                      <h3 className="mb-3">{product.name || "Produto sem nome"}</h3>

                      {/* Preço */}
                      <div className="mb-4">
                        <div className="h2 text-primary mb-0">
                          € {(product.price || 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Badges de Status */}
                      <div className="mb-4">
                        <span className={`badge ${product.isActive ? "bg-success" : "bg-danger"} me-2`}>
                          {product.isActive ? "Ativo" : "Inativo"}
                        </span>
                        {(product.stockQuantity || 0) === 0 && (
                          <span className="badge bg-danger">Sem Estoque</span>
                        )}
                        {(product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 10 && (
                          <span className="badge bg-warning text-dark">Estoque Baixo</span>
                        )}
                      </div>

                      {/* Estoque */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Disponibilidade</h6>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-box-seam text-primary me-2" style={{ fontSize: "1.5rem" }}></i>
                          <span className="fs-5">
                            {product.stockQuantity || 0} {(product.stockQuantity || 0) === 1 ? "unidade" : "unidades"} em estoque
                          </span>
                        </div>
                      </div>

                      {/* Descrição */}
                      {product.description && (
                        <div className="mb-4">
                          <h6 className="text-muted mb-2">Descrição</h6>
                          <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Quantidade */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Quantidade</h6>
                        <div className="d-flex align-items-center gap-3">
                          <div className="input-group" style={{ width: "150px" }}>
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={handleDecreaseQuantity}
                              disabled={quantity <= 1}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={quantity}
                              onChange={handleQuantityChange}
                              min="1"
                              max={product.stockQuantity || 0}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={handleIncreaseQuantity}
                              disabled={quantity >= (product.stockQuantity || 0)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          <span className="text-muted small">
                            ({product.stockQuantity || 0} disponíveis)
                          </span>
                        </div>
                      </div>

                      {/* ⚠️ Aviso para fazer login */}
                      <div className="alert alert-info mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        Faça login para comprar produtos
                      </div>

                      {/* Botões de Ação */}
                      <div className="d-grid gap-3">
                        {/* Comprar Agora */}
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={handleBuyNow}
                          disabled={(product.stockQuantity || 0) === 0 || !product.isActive}
                        >
                          <i className="bi bi-cart-check-fill me-2"></i>
                          Comprar agora
                        </button>

                        {/* Adicionar ao Carrinho */}
                        <button
                          className="btn btn-outline-primary btn-lg"
                          onClick={handleAddToCart}
                          disabled={(product.stockQuantity || 0) === 0 || !product.isActive}
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Adicionar ao carrinho
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ LIGHTBOX FULLSCREEN - ADICIONADO AQUI! */}
      {showLightbox && hasImages && (
        <ImageLightbox
          images={productImages}
          currentIndex={currentImageIndex}
          onClose={handleCloseLightbox}
          productName={product.name}
        />
      )}
    </>
  );
}
