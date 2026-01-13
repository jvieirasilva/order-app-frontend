"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

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

      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          {/* Logo/Brand */}
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-2"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-shop" style={{ fontSize: "1.5rem" }}></i>
            </div>
            <span className="fw-bold fs-4">Order App</span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#publicNavbar"
            aria-controls="publicNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="publicNavbar">
            <ul className="navbar-nav ms-auto">
              {/* Home */}
              <li className="nav-item">
                <Link
                  href="/"
                  className={`nav-link ${isActive("/") ? "active fw-bold" : ""}`}
                >
                  <i className="bi bi-house-door me-1"></i>
                  Home
                </Link>
              </li>

              {/* About */}
              <li className="nav-item">
                <Link
                  href="/about"
                  className={`nav-link ${isActive("/about") ? "active fw-bold" : ""}`}
                >
                  <i className="bi bi-info-circle me-1"></i>
                  About
                </Link>
              </li>

              {/* Divider */}
              <li className="nav-item d-none d-lg-block">
                <span className="nav-link text-muted">|</span>
              </li>

              {/* Login */}
              <li className="nav-item">
                <Link
                  href="/login"
                  className={`nav-link ${
                    isActive("/login") ? "active fw-bold text-primary" : ""
                  }`}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Sign In
                </Link>
              </li>

              {/* Sign Up Button */}
              <li className="nav-item">
                <Link
                  href="/users/register"
                  className={`btn btn-primary ms-lg-2 ${
                    isActive("/users/register") ? "shadow" : ""
                  }`}
                  style={{ borderRadius: "20px" }}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Sign Up
                </Link>
              </li>
            </ul>
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
