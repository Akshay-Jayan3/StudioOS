import "./marketing-theme.css";
import Navbar from "@/components/marketing/layout/Navbar";
import Footer from "@/components/marketing/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-theme">
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
