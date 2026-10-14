import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import BackToTop from "@/components/BackToTop";
import AnimatedBackground from "@/components/AnimatedBackground";
import MobileNav from "@/components/MobileNav";

// Shell compartilhado com uma versão focada para a área administrativa.
export default function Layout() {
  const pathname = useLocation().pathname;
  const isAdmin = pathname === "/admin";
  const isAdminLogin = pathname === "/admin-login";
  const isAdminShell = isAdmin || isAdminLogin;

  return (
    <div
      className={`relative flex min-h-screen min-w-0 flex-col overflow-x-clip ${
        isAdmin ? "ssr-admin-layout" : isAdminLogin ? "ssr-admin-login-layout" : ""
      }`}
    >
      <a href="#conteudo-principal" className="ssr-skip-link">
        Pular para o conteúdo
      </a>
      {!isAdminShell && <AnimatedBackground />}
      <div className="relative z-10 flex flex-1 flex-col">
        {!isAdminShell && <Navbar />}
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className={`min-w-0 flex-1 ${isAdminShell ? "" : "pt-[calc(4.5rem+env(safe-area-inset-top))]"}`}
        >
          <Outlet />
        </main>
        {!isAdminShell && <Footer />}
      </div>
      {!isAdminShell && <BackToTop />}
      {!isAdminShell && <Chatbot />}
      {!isAdminShell && <MobileNav />}
    </div>
  );
}
