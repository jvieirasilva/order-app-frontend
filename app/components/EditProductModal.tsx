"use client";

import { useState, useEffect } from "react";
import { updateProduct, UpdateProductData, Product } from "@/app/services/product.service";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    stockQuantity: string;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    isActive: true,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 10;

  // Carregar dados do produto quando abrir o modal
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        isActive: product.isActive,
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setNewImagePreviews([]);
      setError(null);
    }
  }, [product, isOpen]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const totalImages = existingImages.length + newImages.length;

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (totalImages + files.length > MAX_IMAGES) {
      setError(`Você pode ter no máximo ${MAX_IMAGES} imagens`);
      return;
    }

    // Validar tipo de arquivo
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são permitidas');
        return false;
      }
      return true;
    });

    setNewImages(prev => [...prev, ...validFiles]);

    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.name.trim()) {
      setError("Nome do produto é obrigatório");
      return;
    }

    if (!formData.description.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError("Preço deve ser maior que zero");
      return;
    }

    const stockQuantity = parseInt(formData.stockQuantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      setError("Quantidade em estoque deve ser maior ou igual a zero");
      return;
    }

    if (totalImages === 0) {
      setError("Produto deve ter pelo menos uma imagem");
      return;
    }

    try {
      setLoading(true);

      const productData: UpdateProductData = {
        name: formData.name,
        description: formData.description,
        price: price,
        stockQuantity: stockQuantity,
        isActive: formData.isActive,
        productImages: newImages.length > 0 ? newImages : undefined,
      };

      await updateProduct(product.id, productData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar produto:", err);
      setError(err?.response?.data?.message || "Erro ao atualizar produto");
    } finally {
      setLoading(false);
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
            <div className="col-12 col-lg-8">
              <div
                className="bg-white rounded-3 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="modal-header border-bottom">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar Produto
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
                  <form onSubmit={handleSubmit}>
                    {/* Erro */}
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    )}

                    {/* Nome */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Nome do Produto <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Caneta Esferográfica Azul"
                        maxLength={200}
                        required
                      />
                    </div>

                    {/* Descrição */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Descrição <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva o produto..."
                        maxLength={1000}
                        required
                      />
                    </div>

                    <div className="row">
                      {/* Preço */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">
                          Preço (R$) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      {/* Estoque */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">
                          Estoque <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>

                      {/* Ativo */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Status</label>
                        <div className="form-check form-switch mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            style={{ cursor: "pointer" }}
                          />
                          <label className="form-check-label">
                            {formData.isActive ? "Ativo" : "Inativo"}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Imagens Existentes */}
                    {existingImages.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Imagens Atuais
                          <small className="text-muted ms-2">
                            ({existingImages.length} imagem{existingImages.length !== 1 ? 's' : ''})
                          </small>
                        </label>
                        <div className="row g-2">
                          {existingImages.map((image, index) => (
                            <div key={index} className="col-4 col-md-3 col-lg-2">
                              <div className="position-relative">
                                <img
                                  src={image}
                                  alt={`Imagem ${index + 1}`}
                                  className="img-thumbnail"
                                  style={{ width: "100%", height: "100px", objectFit: "cover" }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                  onClick={() => removeExistingImage(index)}
                                  style={{ padding: "2px 6px" }}
                                  title="Remover imagem"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Adicionar Novas Imagens */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Adicionar Novas Imagens
                        <small className="text-muted ms-2">
                          (Máximo {MAX_IMAGES} imagens total - {totalImages}/{MAX_IMAGES})
                        </small>
                      </label>
                      
                      <div className="border rounded-3 p-3 bg-light">
                        <input
                          type="file"
                          className="form-control mb-3"
                          accept="image/*"
                          multiple
                          onChange={handleNewImageSelect}
                          disabled={totalImages >= MAX_IMAGES}
                        />

                        {/* Preview das Novas Imagens */}
                        {newImagePreviews.length > 0 && (
                          <div className="row g-2">
                            {newImagePreviews.map((preview, index) => (
                              <div key={index} className="col-4 col-md-3 col-lg-2">
                                <div className="position-relative">
                                  <img
                                    src={preview}
                                    alt={`Nova ${index + 1}`}
                                    className="img-thumbnail"
                                    style={{ width: "100%", height: "100px", objectFit: "cover" }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                    onClick={() => removeNewImage(index)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                  <span
                                    className="badge bg-success position-absolute bottom-0 start-0 m-1"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    NOVA
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
