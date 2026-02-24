import axios from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ INTERCEPTOR CORRIGIDO - NÃO ENVIA TOKEN PARA ROTAS PÚBLICAS
api.interceptors.request.use(
  (config) => {
    // ✅ LISTA DE ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
    const publicRoutes = [
      '/api/auth/authenticate',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
       '/api/products/search',         
      '/api/products/searchByCompany', 
    ];

    // ✅ Verificar se a URL é uma rota pública
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (isPublicRoute) {
      console.log("🔓 Rota pública:", config.url, "- Sem token");
      return config;
    }

    // ✅ Para rotas protegidas, adicionar token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      
      if (token) {
        console.log("🔐 Rota protegida:", config.url, "- Token adicionado");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("⚠️ Rota protegida sem token:", config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response Success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    // ✅ Só redirecionar se for 401/403 em rota protegida
    if (error.response?.status === 401 || error.response?.status === 403) {
      const url = error.config?.url || "";
      const isPublicRoute = url.includes("/authenticate") || 
                           url.includes("/register") || 
                           url.includes("/forgot-password") ||
                           url.includes("/products/search");  
      
      if (!isPublicRoute) {
        console.log("🚫 Unauthorized - Limpando localStorage e redirecionando");
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      } else {
        console.log("⚠️ Erro 403 em rota pública - Credenciais inválidas");
      }
    }
    
    return Promise.reject(error);
  }
);