// app/public/layout.tsx
// ✅ Layout público - SEM verificação de autenticação

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Não faz NENHUMA verificação de autenticação
  // ✅ Não chama getCurrentUser()
  // ✅ Não redireciona para /login
  
  return <>{children}</>;
}
