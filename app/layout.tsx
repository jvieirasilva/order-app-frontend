import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

export const metadata = {
  title: "Order App",
  description: "Manage your orders efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* ✅ Wrap tudo com CartProvider */}
        <CartProvider>
          {children}
          
          {/* ✅ CartDrawer - Sempre presente, controla visibilidade internamente */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
