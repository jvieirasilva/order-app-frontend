"use client";

import { useState } from "react";
import { createProduct, CreateProductData } from "@/app/services/product.service";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
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

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 10;

  // Prevenir scroll do body quando modal está aberto
  if (isOpen && typeof document !== 'undefined') {
    document.body.style.overflow = "hidden";
  } else if (typeof document !== 'undefined') {
    document.body.style.overflow = "unset";
  }

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setError(`Você pode adicionar no máximo ${MAX_IMAGES} imagens`);
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

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

    if (selectedImages.length === 0) {
      setError("Adicione pelo menos uma imagem do produto");
      return;
    }

    try {
      setLoading(true);

      const productData: CreateProductData = {
        name: formData.name,
        description: formData.description,
        price: price,
        stockQuantity: stockQuantity,
        isActive: formData.isActive,
        productImages: selectedImages,
      };

      await createProduct(productData);
      
      // Resetar formulário
      setFormData({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        isActive: true,
      });
      setSelectedImages([]);
      setImagePreviews([]);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar produto:", err);
      setError(err?.response?.data?.message || "Erro ao criar produto");
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
                    <i className="bi bi-plus-circle me-2"></i>
                    Adicionar Novo Produto
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

                    {/* Upload de Imagens */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Imagens do Produto <span className="text-danger">*</span>
                        <small className="text-muted ms-2">
                          (Máximo {MAX_IMAGES} imagens)
                        </small>
                      </label>
                      
                      <div className="border rounded-3 p-3 bg-light">
                        <input
                          type="file"
                          className="form-control mb-3"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          disabled={selectedImages.length >= MAX_IMAGES}
                        />

                        {/* Preview das Imagens */}
                        {imagePreviews.length > 0 && (
                          <div className="row g-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="col-4 col-md-3 col-lg-2">
                                <div className="position-relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="img-thumbnail"
                                    style={{ width: "100%", height: "100px", objectFit: "cover" }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                    onClick={() => removeImage(index)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedImages.length === 0 && (
                          <div className="text-center text-muted py-3">
                            <i className="bi bi-images" style={{ fontSize: "3rem" }}></i>
                            <p className="mb-0 mt-2">Nenhuma imagem selecionada</p>
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
                            Criando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Criar Produto
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
