"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { searchProducts, Product } from "@/app/services/product.service";
import { useDebounce } from "@/app/hooks/useDebounce";
import OrderProductCard from "./OrderProductCard";
import OrderProductDetailsPublic from "./OrderProductDetailsPublic";
import NavbarPublic from "../NavbarPublic";

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação e busca
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, 500); // Debounce de 500ms
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12); // 3 linhas x 4 colunas

  // Ref para o observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Buscar produtos
  const fetchProducts = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await searchProducts({
        term: searchTerm,
        page: page,
        size: pageSize,
        sort: "name"
      });

      if (append) {
        // Adiciona novos produtos aos existentes
        setProducts((prev) => [...prev, ...response.content]);
      } else {
        // Substitui produtos (nova busca)
        setProducts(response.content);
      }

      setTotalElements(response.totalElements);
      setHasMore(!response.last); // Se não for a última página, tem mais
    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      setError(err?.response?.data?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, [searchTerm, pageSize]);

  // Carrega produtos iniciais
  useEffect(() => {
    setCurrentPage(0);
    setProducts([]);
    setHasMore(true);
    fetchProducts(0, false);
  }, [searchTerm]);

  // Indicador de busca ativa
  useEffect(() => {
    if (searchInput !== searchTerm) {
      setSearching(true);
    }
  }, [searchInput, searchTerm]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    // Cleanup do observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Cria novo observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px" // Carrega 100px antes de chegar ao fim
      }
    );

    // Observa o elemento
    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    // Cleanup
    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [loading, loadingMore, hasMore, currentPage, fetchProducts]);

  // Busca
  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {/* Navbar Component */}
      <NavbarPublic />

      <div className="min-vh-100 bg-light">
        <div className="container pb-5 pt-4">
          {/* Header */}
          <div className="mb-4">
            <h2 className="mb-0">
              <i className="bi bi-cart-fill me-2 text-warning"></i>
              Fazer Pedido
            </h2>
            <p className="text-muted mb-0">Selecione os produtos para seu pedido</p>
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
              {products.length} de {totalElements} {totalElements === 1 ? "produto" : "produtos"}
            </small>
          </div>

          {/* Loading inicial */}
          {loading && products.length === 0 && (
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
                    <OrderProductCard 
                      product={product} 
                      onClick={handleProductClick}
                    />
                  </div>
                ))}
              </div>

              {/* Elemento observado para scroll infinito */}
              {hasMore && products.length > 0 && (
                <div ref={loadMoreRef} className="text-center py-4">
                  {loadingMore && (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Carregando mais...</span>
                      </div>
                      <span className="text-muted">Carregando mais produtos...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sem mais produtos */}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-4">
                  <small className="text-muted">
                    <i className="bi bi-check-circle me-1"></i>
                    Todos os produtos foram carregados
                  </small>
                </div>
              )}

              {/* Sem resultados */}
              {products.length === 0 && !loading && (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                  <h5 className="mt-3 text-muted">Nenhum produto encontrado</h5>
                  <p className="text-muted">Tente buscar com outros termos</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalhes - Versão Pública */}
      <OrderProductDetailsPublic product={selectedProduct} onClose={handleCloseDetails} />
    </>
  );
}
