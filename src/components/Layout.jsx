import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import BackToTop from "@/components/BackToTop";
import AnimatedBackground from "@/components/AnimatedBackground";
import MobileNav from "@/components/MobileNav";

// Shell compartilhado: navbar + conteúdo + rodapé + ferramentas flutuantes
export default function Layout() {
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <a href="#conteudo-principal" className="ssr-skip-link">Pular para o conteúdo</a>
      <AnimatedBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />
        <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 pt-[calc(4.5rem_+_env(safe-area-inset-top))]">
          <Outlet />
        </main>
        <Footer />
      </div>
      <BackToTop />
      <Chatbot />
      <MobileNav />
    </div>
  );
}