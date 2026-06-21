import "./marketing-theme.css";
import Navbar from "@/components/marketing/layout/Navbar";
import Footer from "@/components/marketing/layout/Footer";
import ChatWidget from "@/components/marketing/chat/ChatWidget";
import { getSiteSettings } from "@/lib/site-settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="marketing-theme">
      <Navbar studioName={settings.studio_name} />
      <main className="relative">{children}</main>
      <Footer studioName={settings.studio_name} contactEmail={settings.contact_email} />
      <ChatWidget studioName={settings.studio_name} />
    </div>
  );
}
