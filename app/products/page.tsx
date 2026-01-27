"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchProductsByCompany,  Product, deleteProduct } from "@/app/services/product.service";
import { isAuthenticated } from "@/app/services/auth.service";
import { useDebounce } from "@/app/hooks/useDebounce";
import ProductCard from "@/app/components/ProductCard";
import ProductDetails from "@/app/components/ProductDetails";
import Navbar from "@/app/components/Navbar";
import CreateProductModal from "@/app/components/CreateProductModal";
import EditProductModal from "@/app/components/EditProductModal";



export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação e busca
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, 500); // Debounce de 500ms
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12); // 3 linhas x 4 colunas

  const [companyId, setCompanyId] = useState<number | null>(null);
  

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // ✅ PROTEÇÃO: REDIRECIONAR SE NÃO FOR ADMIN
  useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      if (user.role !== "ADMIN") {
        router.push("/");
        return;
      }

      const id = user.company?.id ?? null;
      if (!id) {
        console.log("⚠️ Usuário ADMIN sem company vinculada");
        router.push("/");
        return;
      }

      setCompanyId(id);
    } catch (error) {
      router.push("/");
      return;
    }
  } else {
    router.push("/");
    return;
  }
}, [router]);

  // Buscar produtos
  const fetchProducts = useCallback(async () => {
  if (!companyId) return;
    try {
      setLoading(true);
      setError(null);

      const response = await searchProductsByCompany({
        companyId,
        term: searchTerm,
        page: currentPage,
        size: pageSize,
        sort: "name"
      });

      setProducts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      setError(err?.response?.data?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [companyId,searchTerm, currentPage, pageSize]);

  useEffect(() => {
  if (!companyId) return;
  if (isAuthenticated() && companyId) {
    fetchProducts();
  }
}, [fetchProducts, companyId]);
  // Indicador de busca ativa
  useEffect(() => {
    if (searchInput !== searchTerm) {
      setSearching(true);
    }
  }, [searchInput, searchTerm]);

  // Busca
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setCurrentPage(0); // Reset para primeira página ao buscar
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateSuccess = () => {
    // Recarregar lista de produtos
    fetchProducts();
  };

  const handleEditSuccess = () => {
    // Recarregar lista de produtos
    fetchProducts();
  };
 
  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja deletar "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      fetchProducts(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
    }
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav aria-label="Navegação de produtos">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {startPage > 0 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(0)}>
                  1
                </button>
              </li>
              {startPage > 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {pages.map((page) => (
            <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(page)}>
                {page + 1}
              </button>
            </li>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      {/* Navbar Component */}
      <Navbar />

      <div className="min-vh-100 bg-light">
        <div className="container pb-5 pt-4">
          {/* Header com Botão de Adicionar */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-box-seam me-2"></i>
              Produtos
            </h2>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Adicionar Produto
            </button>
          </div>

          {/* Busca */}
          <div className="row mb-4">
            <div className="col-12 col-lg-8 mx-auto">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white">
                  {searching ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Buscando...</span>
                    </div>
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar produtos..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchInput && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleSearch("")}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-3">
            <small className="text-muted">
              {totalElements} {totalElements === 1 ? "produto encontrado" : "produtos encontrados"}
            </small>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Grid de Produtos - 4 colunas */}
          {!loading && !error && (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {products.map((product) => (
                  <div key={product.id} className="col">
                    <ProductCard 
                      product={product} 
                      onClick={handleProductClick}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>

              {/* Sem resultados */}
              {products.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                  <h5 className="mt-3 text-muted">Nenhum produto encontrado</h5>
                  <p className="text-muted">Tente buscar com outros termos</p>
                </div>
              )}

              {/* Paginação */}
              {products.length > 0 && (
                <div className="mt-5">
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <ProductDetails product={selectedProduct} onClose={handleCloseDetails} />

      {/* Modal de Criar Produto */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        companyId={companyId}

      />

      {/* Modal de Editar Produto */}
      <EditProductModal
        product={productToEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        companyId={companyId}
      />
    </>
  );
}
