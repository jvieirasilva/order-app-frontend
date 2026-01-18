"use client";

import { useState, useEffect } from "react";
import { Product } from "@/app/services/product.service";

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetails({ product, onClose }: ProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Reset ao abrir novo produto
    setCurrentImageIndex(0);
    setQuantity(1);
  }, [product?.id]);

  // Prevenir scroll do body quando modal está aberto
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

  if (!product) return null;

  const currentImage = product.images[currentImageIndex] || "/placeholder-image.png";
  const hasImages = product.images.length > 0;

  const handleAddToCart = () => {
    console.log(`Adicionar ${quantity}x ${product.name} ao carrinho`);
    // Implementar lógica do carrinho aqui
  };

  const handleBuyNow = () => {
    console.log(`Comprar agora ${quantity}x ${product.name}`);
    // Implementar lógica de compra direta aqui
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 overflow-auto"
        style={{ zIndex: 1051 }}
        onClick={onClose}
      >
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div
                className="bg-white rounded-3 shadow-lg position-relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botão Fechar */}
                <button
                  className="btn-close position-absolute top-0 end-0 m-3"
                  onClick={onClose}
                  style={{ zIndex: 10 }}
                  aria-label="Fechar"
                />

                <div className="row g-0">
                  {/* Coluna da Imagem */}
                  <div className="col-md-6 p-4 border-end">
                    {/* Imagem Principal com Setas */}
                    <div
                      className="bg-light rounded-3 mb-3 position-relative d-flex align-items-center justify-content-center"
                      style={{ height: "400px", overflow: "hidden" }}
                    >
                      {hasImages ? (
                        <img
                          src={currentImage}
                          alt={product.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain"
                          }}
                        />
                      ) : (
                        <i className="bi bi-image" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                      )}
                      
                      {/* Setas de Navegação - Apenas se tiver múltiplas imagens */}
                      {product.images.length > 1 && (
                        <>
                          {/* Seta Esquerda */}
                          <button
                            className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow"
                            style={{ 
                              marginLeft: "10px", 
                              width: "45px", 
                              height: "45px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 10
                            }}
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? product.images.length - 1 : prev - 1
                            )}
                            aria-label="Imagem anterior"
                          >
                            <i className="bi bi-chevron-left" style={{ fontSize: "1.5rem" }}></i>
                          </button>
                          
                          {/* Seta Direita */}
                          <button
                            className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow"
                            style={{ 
                              marginRight: "10px", 
                              width: "45px", 
                              height: "45px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 10
                            }}
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === product.images.length - 1 ? 0 : prev + 1
                            )}
                            aria-label="Próxima imagem"
                          >
                            <i className="bi bi-chevron-right" style={{ fontSize: "1.5rem" }}></i>
                          </button>
                          
                          {/* Contador de Imagens */}
                          <div 
                            className="position-absolute bottom-0 end-0 m-3 bg-dark bg-opacity-75 text-white px-3 py-1 rounded-pill"
                            style={{ fontSize: "0.875rem" }}
                          >
                            {currentImageIndex + 1} / {product.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails - Galeria de Miniaturas */}
                    {product.images.length > 1 && (
                      <div 
                        className="thumbnails-gallery"
                        style={{ 
                          overflowX: "auto", 
                          overflowY: "hidden",
                          paddingBottom: "8px"
                        }}
                      >
                        <div className="d-flex gap-2">
                          {product.images.map((image, index) => (
                            <div
                              key={index}
                              className="thumbnail-item"
                              style={{
                                minWidth: "80px",
                                width: "80px",
                                height: "80px",
                                cursor: "pointer",
                                border: index === currentImageIndex 
                                  ? "3px solid #3483fa" 
                                  : "2px solid #e0e0e0",
                                borderRadius: "8px",
                                overflow: "hidden",
                                flexShrink: 0,
                                transition: "all 0.2s ease",
                                opacity: index === currentImageIndex ? 1 : 0.6,
                                transform: index === currentImageIndex ? "scale(1)" : "scale(0.95)"
                              }}
                              onClick={() => setCurrentImageIndex(index)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                                e.currentTarget.style.transform = "scale(1)";
                                if (index !== currentImageIndex) {
                                  e.currentTarget.style.border = "2px solid #999";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index !== currentImageIndex) {
                                  e.currentTarget.style.opacity = "0.6";
                                  e.currentTarget.style.transform = "scale(0.95)";
                                  e.currentTarget.style.border = "2px solid #e0e0e0";
                                }
                              }}
                            >
                              <img
                                src={image}
                                alt={`${product.name} - Imagem ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover"
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coluna das Informações */}
                  <div className="col-md-6 p-4">
                    <div className="d-flex flex-column h-100">
                      {/* Informações do Produto */}
                      <div className="flex-grow-1">
                        <h4 className="mb-3">{product.name}</h4>

                        {/* Preço */}
                        <div className="mb-4">
                          <div className="d-flex align-items-baseline gap-2">
                            <span className="display-5 fw-bold text-dark">
                              € {product.price.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <small className="text-muted">À vista no PIX/transferência</small>
                        </div>

                        {/* Status de Estoque */}
                        <div className="mb-4">
                          {product.stockQuantity > 0 ? (
                            <>
                              <div className="text-success mb-2">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>Estoque disponível</strong>
                              </div>
                              <small className="text-muted">
                                {product.stockQuantity} unidades disponíveis
                              </small>
                            </>
                          ) : (
                            <div className="text-danger">
                              <i className="bi bi-x-circle-fill me-2"></i>
                              <strong>Produto esgotado</strong>
                            </div>
                          )}
                        </div>

                        {/* Descrição */}
                        {product.description && (
                          <div className="mb-4">
                            <h6 className="fw-bold">Descrição</h6>
                            <p className="text-muted">{product.description}</p>
                          </div>
                        )}

                        {/* Quantidade */}
                        {product.stockQuantity > 0 && (
                          <div className="mb-4">
                            <label className="form-label fw-semibold">Quantidade</label>
                            <div className="input-group" style={{ maxWidth: "150px" }}>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="text"
                                className="form-control text-center"
                                value={quantity}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                disabled={quantity >= product.stockQuantity}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      {product.stockQuantity > 0 && (
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={handleBuyNow}
                          >
                            <i className="bi bi-cart-check me-2"></i>
                            Comprar agora
                          </button>
                          <button
                            className="btn btn-outline-primary btn-lg"
                            onClick={handleAddToCart}
                          >
                            <i className="bi bi-cart-plus me-2"></i>
                            Adicionar ao carrinho
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
