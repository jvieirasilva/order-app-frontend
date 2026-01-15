"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout, getCurrentUser } from "../services/auth.service";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // ✅ Hook do carrinho (conectado ao backend)
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const isActive = (path: string) => pathname === path;
  const isAdmin = currentUser?.role === "ADMIN";
  
  const navLinks = [
    { href: "/", label: "Home", icon: "bi-house-door", adminOnly: false },
    { href: "/users/search", label: "Users", icon: "bi-people", adminOnly: true },
    { href: "/users/register", label: "Register User", icon: "bi-person-plus", adminOnly: true },
    { href: "/products", label: "Products", icon: "bi-box-seam", adminOnly: true },
    { href: "/orders", label: "Orders", icon: "bi-cart", adminOnly: false },
    { href: "/reports", label: "Reports", icon: "bi-file-earmark-text", adminOnly: false },
    { href: "/settings", label: "Settings", icon: "bi-gear", adminOnly: false },
  ];

  const filteredNavLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

  function handleLogout() {
    logout();
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

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR MENU */}
      <div
        className="position-fixed top-0 start-0 h-100 bg-primary text-white"
        style={{
          width: "280px",
          zIndex: 1050,
          transition: "transform 0.3s ease-in-out",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          overflowY: "auto",
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-light border-opacity-25">
          <h5 className="mb-0">
            <i className="bi bi-shop me-2"></i>
            Menu
          </h5>
          <button
            className="btn btn-sm text-white"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="nav flex-column p-3">
          {filteredNavLinks.map((link) => (
            <li key={link.href} className="nav-item mb-2">
              <Link
                href={link.href}
                className={`nav-link text-white d-flex align-items-center rounded ${
                  isActive(link.href) ? "bg-white bg-opacity-25" : ""
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <i className={`${link.icon} me-3`} style={{ fontSize: "1.2rem" }}></i>
                {link.label}
                {link.adminOnly && (
                  <span className="badge bg-danger ms-auto" style={{ fontSize: "0.65rem" }}>
                    ADMIN
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* SIDEBAR FOOTER */}
        <div className="position-absolute bottom-0 w-100 p-3 border-top border-light border-opacity-25">
          <div className="d-flex align-items-center text-white mb-2">
            {currentUser?.profileImageUrl ? (
              <img 
                src={currentUser.profileImageUrl} 
                alt={currentUser.fullName || "User"} 
                style={{ 
                  width: "45px", 
                  height: "45px", 
                  objectFit: "cover", 
                  borderRadius: "50%",
                  border: "2px solid rgba(255, 255, 255, 0.3)"
                }} 
                className="me-2"
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1.2rem",
                  fontWeight: "bold"
                }}
              >
                {currentUser?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fw-semibold" style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.fullName || "Admin User"}
              </div>
              <small className="text-white text-opacity-75" style={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                {currentUser?.email || "admin@example.com"}
              </small>
              {isAdmin && (
                <span className="badge bg-danger mt-1" style={{ fontSize: "0.65rem" }}>
                  ADMIN
                </span>
              )}
            </div>
          </div>
          
          <button 
            className="btn btn-outline-light btn-sm w-100"
            onClick={handleLogout} 
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout 
          </button>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          {/* Botão Sidebar */}
          <button
            className="btn me-2 text-white"
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar menu"
            style={{
              backgroundColor: "transparent",
              border: "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <i className="bi bi-list" style={{ fontSize: "1.8rem" }}></i>
          </button>

          {/* Logo */}
          <Link href="/" className="navbar-brand">
            <i className="bi bi-shop me-2"></i>
            Order App
          </Link>

          {/* ✅ BOTÃO CARRINHO - Visível em todas as telas */}
          <button
            className="btn btn-light position-relative ms-auto me-2"
            style={{ borderRadius: "50%", width: "45px", height: "45px" }}
            onClick={openCart}
            title="Abrir Carrinho"
          >
            <i className="bi bi-cart3" style={{ fontSize: "1.3rem" }}></i>
            {/* ✅ Badge com quantidade (do backend) */}
            {totalItems > 0 && (
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.65rem" }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Navbar Links - Desktop */}
          <div className="collapse navbar-collapse d-none d-lg-flex" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                  Home
                </Link>
              </li>
              
              {isAdmin && (
                <li className="nav-item">
                  <Link
                    href="/users/search"
                    className={`nav-link ${isActive("/users/search") ? "active" : ""}`}
                  >
                    Users
                  </Link>
                </li>
              )}
              
              {isAdmin && (
                <li className="nav-item">
                  <Link
                    href="/products"
                    className={`nav-link ${isActive("/products") ? "active" : ""}`}
                  >
                    Products
                  </Link>
                </li>
              )}
              
              <li className="nav-item">
                <Link
                  href="/orders"
                  className={`nav-link ${isActive("/orders") ? "active" : ""}`}
                >
                  Orders
                </Link>
              </li>
            </ul>

            {/* User Info - Desktop */}
            <div className="d-flex align-items-center">
              <span className="text-white me-3">
                <i className="bi bi-person-circle me-1"></i>
                {currentUser?.fullName || "Admin"}
                {isAdmin && (
                  <span className="badge bg-danger ms-2" style={{ fontSize: "0.65rem" }}>
                    ADMIN
                  </span>
                )}
              </span>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
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
