import AuthenticatedHeader from "@/components/layout/authenticated-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthenticatedHeader />
      <main className="min-h-screen">{children}</main>
    </>
  );
} 