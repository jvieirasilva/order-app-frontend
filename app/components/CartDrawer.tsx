"use client";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isLoading,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1040 }}
        onClick={closeCart}
      />

      {/* Cart Drawer */}
      <div
        className="position-fixed top-0 end-0 h-100 bg-white"
        style={{
          width: "400px",
          maxWidth: "90vw",
          zIndex: 1050,
          boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-cart3 me-2"></i>
            Carrinho ({totalItems})
          </h5>
          <button
            className="btn btn-sm text-white"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={closeCart}
          >
            <i className="bi bi-x-lg" style={{ fontSize: "1.2rem" }}></i>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Items List */}
        {!isLoading && (
          <div className="flex-grow-1 overflow-auto p-3">
            {items.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-cart-x" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3">Carrinho vazio</p>
                <p className="small">Adicione produtos para continuar</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="card shadow-sm"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex gap-3">
                        {/* Imagem */}
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#f0f0f0",
                            flexShrink: 0,
                          }}
                        >
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                              <i
                                className="bi bi-image text-muted"
                                style={{ fontSize: "2rem" }}
                              ></i>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          {/* Nome do Produto */}
                          <h6
                            className="mb-1"
                            style={{
                              fontSize: "0.9rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.productName}
                          </h6>

                          {/* Preço */}
                          <div className="text-primary fw-bold mb-2">
                            R$ {item.priceAtAddition.toFixed(2)}
                          </div>

                          {/* Controles de Quantidade */}
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  updateQuantity(item.cartItemId, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || isLoading}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                style={{ minWidth: "45px" }}
                              >
                                {item.quantity}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  updateQuantity(item.cartItemId, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.maxStock || isLoading}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>

                            {/* Botão Remover */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.cartItemId)}
                              disabled={isLoading}
                              title="Remover"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-end text-muted small mt-2">
                            Subtotal: R$ {item.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && !isLoading && (
          <div className="border-top p-3 bg-light">
            {/* Limpar Carrinho */}
            <button
              className="btn btn-sm btn-outline-danger w-100 mb-3"
              onClick={clearCart}
              disabled={isLoading}
            >
              <i className="bi bi-trash me-2"></i>
              Limpar Carrinho
            </button>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fs-4 fw-bold text-primary">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Botão Finalizar */}
            <button
              className="btn btn-primary w-100 py-2"
              disabled={isLoading}
            >
              <i className="bi bi-check-circle me-2"></i>
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
