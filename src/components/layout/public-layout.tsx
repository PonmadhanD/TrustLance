import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header className="" />
      <main className="flex-1">{children}</main>
      <Footer className="" />
    </>
  );
} 