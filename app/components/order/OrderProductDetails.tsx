"use client";

import { useState, useEffect } from "react";
import { Product } from "@/app/services/product.service";
import { useCart } from "@/app/context/CartContext"; // ✅ Importar

interface OrderProductDetailsProps {
  product: Product | null;
  onClose: () => void;
}

export default function OrderProductDetails({ product, onClose }: OrderProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // ✅ Loading state
  
  const { addItem } = useCart(); // ✅ Hook do carrinho

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

  if (!product) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const currentImage = product.images[currentImageIndex] || "/placeholder-image.png";

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stockQuantity) {
      setQuantity(value);
    }
  };

  const handleBuyNow = () => {
    // TODO: Implementar lógica de comprar agora
    console.log(`Comprar agora: ${product.name}, Quantidade: ${quantity}`);
    alert(`Comprando ${quantity} unidade(s) de "${product.name}"`);
  };

  // ✅ IMPLEMENTAÇÃO CORRETA
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      await addItem(product.id, quantity);
      
      // ✅ Feedback de sucesso
      alert(`✅ ${quantity} unidade(s) de "${product.name}" adicionado(s) ao carrinho!`);
      
      // ✅ Opcional: Fechar modal após adicionar
      // onClose();
      
    } catch (error: any) {
      console.error("Erro ao adicionar ao carrinho:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Erro ao adicionar ao carrinho";
      
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setIsAddingToCart(false);
    }
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
                    {/* Galeria de Imagens */}
                    <div className="col-lg-6 mb-4 mb-lg-0">
                      {/* Imagem Principal */}
                      <div className="position-relative mb-3" style={{ height: "400px" }}>
                        <img
                          src={currentImage}
                          alt={product.name}
                          className="w-100 h-100 object-fit-contain rounded"
                          style={{ backgroundColor: "#f8f9fa" }}
                        />

                        {/* Setas de Navegação */}
                        {product.images.length > 1 && (
                          <>
                            <button
                              className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow ms-2"
                              style={{ width: "45px", height: "45px" }}
                              onClick={handlePrevImage}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            <button
                              className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow me-2"
                              style={{ width: "45px", height: "45px" }}
                              onClick={handleNextImage}
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>

                            {/* Contador */}
                            <div
                              className="position-absolute bottom-0 end-0 badge bg-dark m-3"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {currentImageIndex + 1} / {product.images.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {product.images.length > 1 && (
                        <div className="d-flex gap-2 overflow-auto pb-2">
                          {product.images.map((image, index) => (
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
                                alt={`${product.name} - ${index + 1}`}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="col-lg-6">
                      <h3 className="mb-3">{product.name}</h3>

                      {/* Preço */}
                      <div className="mb-4">
                        <div className="h2 text-primary mb-0">
                          R$ {product.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Badges de Status */}
                      <div className="mb-4">
                        <span className={`badge ${product.isActive ? "bg-success" : "bg-danger"} me-2`}>
                          {product.isActive ? "Ativo" : "Inativo"}
                        </span>
                        {product.stockQuantity === 0 && (
                          <span className="badge bg-danger">Sem Estoque</span>
                        )}
                        {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                          <span className="badge bg-warning text-dark">Estoque Baixo</span>
                        )}
                      </div>

                      {/* Estoque */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Disponibilidade</h6>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-box-seam text-primary me-2" style={{ fontSize: "1.5rem" }}></i>
                          <span className="fs-5">
                            {product.stockQuantity} {product.stockQuantity === 1 ? "unidade" : "unidades"} em estoque
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
                              max={product.stockQuantity}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={handleIncreaseQuantity}
                              disabled={quantity >= product.stockQuantity}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          <span className="text-muted small">
                            ({product.stockQuantity} disponíveis)
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="d-grid gap-3">
                        {/* Comprar Agora */}
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={handleBuyNow}
                          disabled={product.stockQuantity === 0 || !product.isActive}
                        >
                          <i className="bi bi-cart-check-fill me-2"></i>
                          Comprar agora
                        </button>

                        {/* Adicionar ao Carrinho - ✅ CORRIGIDO */}
                        <button
                          className="btn btn-outline-primary btn-lg"
                          onClick={handleAddToCart}
                          disabled={product.stockQuantity === 0 || !product.isActive || isAddingToCart}
                        >
                          {isAddingToCart ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Adicionando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cart-plus me-2"></i>
                              Adicionar ao carrinho
                            </>
                          )}
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
    </>
  );
}