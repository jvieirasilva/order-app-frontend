"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext"; 

export default function NavbarPublic() {
  const { totalItems, openCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.log("Não logado");
    }
  }, []);

  const isActive = (path: string) => pathname === path;
  const isLoggedIn = !!currentUser;

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  function handleLogin() {
    router.push("/login");
  }

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />

      {/* NAVBAR PRINCIPAL */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          {/* Logo */}
          <Link href="/public/order" className="navbar-brand">
            <i className="bi bi-shop me-2"></i>
            Order App
          </Link>

          {/* Botão Carrinho - só aparece se logado */}
          {isLoggedIn && (
            <button
              className="btn btn-light position-relative"
              style={{ borderRadius: "50%", width: "45px", height: "45px" }}
              onClick={openCart}
              title="Abrir Carrinho"
            >
              <i className="bi bi-cart3" style={{ fontSize: "1.3rem" }}></i>
              {totalItems > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.65rem" }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Botões direita */}
          <div className="d-flex align-items-center gap-2">
            {/* Link Fazer Pedido */}
            <Link 
              href="/public/order" 
              className="btn btn-outline-light btn-sm d-none d-md-block"
            >
              <i className="bi bi-cart3 me-1"></i>
              Fazer Pedido
            </Link>

            {/* Botão Login/Logout */}
            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-white d-none d-md-inline">
                  <i className="bi bi-person-circle me-1"></i>
                  {currentUser?.fullName || "User"}
                </span>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-light btn-sm"
                onClick={handleLogin}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        async
      ></script>
    </>
  );
}
