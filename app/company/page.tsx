"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/app/services/auth.service";
import { getCompanyById, updateCompany, CompanyRequest, CompanyResponse } from "@/app/services/company.service";
import Navbar from "@/app/components/Navbar";

export default function CompanyPage() {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompanyRequest>({
    companyName: "",
    tradeName: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "Portugal",
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Verificar autenticação e permissão
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getCurrentUser();
    
    // Verificar se é ADMIN
    if (currentUser?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    // Verificar se tem empresa associada
    if (!currentUser?.company?.id) {
      setError("Usuário ADMIN sem empresa associada");
      setLoading(false);
      return;
    }

    // Buscar dados da empresa
    fetchCompany(currentUser.company.id);
  }, [router]);

  const fetchCompany = async (companyId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCompanyById(companyId);
      setCompany(data);
      
      // Preencher formulário com dados da empresa
      setFormData({
        companyName: data.companyName || "",
        tradeName: data.tradeName || "",
        nif: data.nif || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        postalCode: data.postalCode || "",
        city: data.city || "",
        country: data.country || "Portugal",
        isActive: data.isActive ?? true,
      });
    } catch (err: any) {
      console.error("Erro ao buscar empresa:", err);
      setError(err?.response?.data?.message || "Erro ao carregar dados da empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));

    // Limpar erro de validação do campo
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Company Name (obrigatório)
    if (!formData.companyName.trim()) {
      errors.companyName = "Nome da empresa é obrigatório";
    } else if (formData.companyName.length > 255) {
      errors.companyName = "Nome da empresa deve ter no máximo 255 caracteres";
    }

    // NIF (obrigatório, 9 dígitos)
    if (!formData.nif.trim()) {
      errors.nif = "NIF é obrigatório";
    } else if (!/^[0-9]{9}$/.test(formData.nif)) {
      errors.nif = "NIF deve ter exatamente 9 dígitos";
    }

    // Email (opcional, mas se fornecido deve ser válido)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    // Phone (opcional, mas se fornecido deve ser válido)
    if (formData.phone && !/^(\+351)?[0-9]{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Telefone deve ter 9 dígitos (formato: +351 ou 9 dígitos)";
    }

    // Postal Code (opcional, mas se fornecido deve ser válido)
    if (formData.postalCode && !/^[0-9]{4}-[0-9]{3}$/.test(formData.postalCode)) {
      errors.postalCode = "Código postal deve estar no formato XXXX-XXX";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!company?.id) {
      setError("ID da empresa não encontrado");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateCompany(company.id, formData);
      
      setSuccessMessage("Dados da empresa atualizados com sucesso!");
      
      // Atualizar dados locais
      await fetchCompany(company.id);

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err: any) {
      console.error("Erro ao atualizar empresa:", err);
      setError(err?.response?.data?.message || "Erro ao atualizar dados da empresa");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (company) {
      setFormData({
        companyName: company.companyName || "",
        tradeName: company.tradeName || "",
        nif: company.nif || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        postalCode: company.postalCode || "",
        city: company.city || "",
        country: company.country || "Portugal",
        isActive: company.isActive ?? true,
      });
      setValidationErrors({});
      setError(null);
      setSuccessMessage(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-vh-100 bg-light">
        <div className="container py-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <h2 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Dados da Empresa
              </h2>
              <p className="text-muted mt-2">
                Gerencie as informações da sua empresa
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage(null)}
              ></button>
            </div>
          )}

          {/* Form */}
          {!loading && company && (
            <div className="row">
              <div className="col-12 col-lg-10 col-xl-8 mx-auto">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                      {/* Informações Básicas */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="border-bottom pb-2 mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Informações Básicas
                          </h5>
                        </div>

                        {/* Company Name */}
                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="companyName" className="form-label fw-semibold">
                            Nome da Empresa <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${validationErrors.companyName ? "is-invalid" : ""}`}
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            maxLength={255}
                            required
                          />
                          {validationErrors.companyName && (
                            <div className="invalid-feedback">{validationErrors.companyName}</div>
                          )}
                        </div>

                        {/* Trade Name */}
                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="tradeName" className="form-label fw-semibold">
                            Nome Comercial
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="tradeName"
                            name="tradeName"
                            value={formData.tradeName}
                            onChange={handleInputChange}
                            maxLength={255}
                          />
                        </div>

                        {/* NIF */}
                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="nif" className="form-label fw-semibold">
                            NIF <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${validationErrors.nif ? "is-invalid" : ""}`}
                            id="nif"
                            name="nif"
                            value={formData.nif}
                            onChange={handleInputChange}
                            maxLength={9}
                            pattern="[0-9]{9}"
                            required
                          />
                          {validationErrors.nif && (
                            <div className="invalid-feedback">{validationErrors.nif}</div>
                          )}
                          <small className="form-text text-muted">9 dígitos</small>
                        </div>

                        {/* Status */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label fw-semibold">Status</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="isActive"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label" htmlFor="isActive">
                              {formData.isActive ? (
                                <span className="badge bg-success">Ativa</span>
                              ) : (
                                <span className="badge bg-secondary">Inativa</span>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Contato */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="border-bottom pb-2 mb-3">
                            <i className="bi bi-telephone me-2"></i>
                            Contato
                          </h5>
                        </div>

                        {/* Email */}
                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="email" className="form-label fw-semibold">
                            Email
                          </label>
                          <input
                            type="email"
                            className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            maxLength={255}
                          />
                          {validationErrors.email && (
                            <div className="invalid-feedback">{validationErrors.email}</div>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="col-12 col-md-6 mb-3">
                          <label htmlFor="phone" className="form-label fw-semibold">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            className={`form-control ${validationErrors.phone ? "is-invalid" : ""}`}
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength={20}
                          />
                          {validationErrors.phone && (
                            <div className="invalid-feedback">{validationErrors.phone}</div>
                          )}
                          <small className="form-text text-muted">Formato: +351XXXXXXXXX ou XXXXXXXXX</small>
                        </div>
                      </div>

                      {/* Endereço */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="border-bottom pb-2 mb-3">
                            <i className="bi bi-geo-alt me-2"></i>
                            Endereço
                          </h5>
                        </div>

                        {/* Address */}
                        <div className="col-12 mb-3">
                          <label htmlFor="address" className="form-label fw-semibold">
                            Morada
                          </label>
                          <textarea
                            className="form-control"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={2}
                            maxLength={500}
                          />
                        </div>

                        {/* Postal Code */}
                        <div className="col-12 col-md-4 mb-3">
                          <label htmlFor="postalCode" className="form-label fw-semibold">
                            Código Postal
                          </label>
                          <input
                            type="text"
                            className={`form-control ${validationErrors.postalCode ? "is-invalid" : ""}`}
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="XXXX-XXX"
                            maxLength={8}
                          />
                          {validationErrors.postalCode && (
                            <div className="invalid-feedback">{validationErrors.postalCode}</div>
                          )}
                        </div>

                        {/* City */}
                        <div className="col-12 col-md-4 mb-3">
                          <label htmlFor="city" className="form-label fw-semibold">
                            Cidade
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            maxLength={100}
                          />
                        </div>

                        {/* Country */}
                        <div className="col-12 col-md-4 mb-3">
                          <label htmlFor="country" className="form-label fw-semibold">
                            País
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            maxLength={100}
                          />
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="row">
                        <div className="col-12">
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleReset}
                              disabled={saving}
                            >
                              <i className="bi bi-arrow-counterclockwise me-2"></i>
                              Resetar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Salvando...</span>
                                  </span>
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-save me-2"></i>
                                  Salvar Alterações
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="card shadow-sm mt-3">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-info-circle me-2"></i>
                      Informações do Sistema
                    </h6>
                    <div className="row mt-3">
                      <div className="col-6 col-md-3 mb-2">
                        <small className="text-muted d-block">ID</small>
                        <strong>{company.id}</strong>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <small className="text-muted d-block">Status</small>
                        {company.isActive ? (
                          <span className="badge bg-success">Ativa</span>
                        ) : (
                          <span className="badge bg-secondary">Inativa</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
