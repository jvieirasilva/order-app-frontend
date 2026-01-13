"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "USER";
  profileImageUrl?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário do localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isUser = user?.role === "USER";

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <h1 className="display-4 mb-4">Welcome to Order App</h1>
            <p className="lead text-muted mb-4">
              Manage your users, products, and orders in one place
            </p>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-4 mt-5 justify-content-center">
                {/* CARD USERS - Apenas para ADMIN */}
                {isAdmin && (
                  <div className="col-md-4">
                    <div className="card h-100 shadow-sm hover-card">
                      <div className="card-body text-center">
                        <i className="bi bi-people-fill text-primary" style={{ fontSize: "3rem" }}></i>
                        <h5 className="card-title mt-3">Users</h5>
                        <p className="card-text">Manage user accounts and permissions</p>
                        <Link href="/users/search" className="btn btn-primary">
                          Go to Users
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CARD PRODUCTS - Apenas para ADMIN */}
                {isAdmin && (
                  <div className="col-md-4">
                    <div className="card h-100 shadow-sm hover-card">
                      <div className="card-body text-center">
                        <i className="bi bi-box-seam text-success" style={{ fontSize: "3rem" }}></i>
                        <h5 className="card-title mt-3">Products</h5>
                        <p className="card-text">Browse and manage your inventory</p>
                        <Link href="/products" className="btn btn-success">
                          Go to Products
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CARD ORDERS - Para ADMIN e USER */}
                <div className="col-md-4">
                  <div className="card h-100 shadow-sm hover-card">
                    <div className="card-body text-center">
                      <i className="bi bi-cart-fill text-warning" style={{ fontSize: "3rem" }}></i>
                      <h5 className="card-title mt-3">Orders</h5>
                      <p className="card-text">Track and manage customer orders</p>
                      <Link href="/order" className="btn btn-warning">
                        Go to Orders
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informação do Usuário */}
            {user && (
              <div className="mt-5">
                <div className="alert alert-info d-inline-block">
                  <i className="bi bi-info-circle me-2"></i>
                  Logged in as: <strong>{user.fullName}</strong> ({user.role})
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .hover-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
        `}</style>
      </>
    </ProtectedRoute>
  );
}
