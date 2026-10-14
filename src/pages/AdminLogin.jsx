import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { getAdmin, loginAdminAccount } from "@/lib/adminAuth";
import "./../styles/admin-login.css";

// A autenticação permanece ligada à conta administrativa existente.
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErr(null);

    try {
      await loginAdminAccount(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (error) {
      setErr(error?.message || "Não foi possível entrar. Confira seus dados e tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  // A sessão continua sendo validada pelo AdminGuard no servidor.
  if (getAdmin()) return <Navigate to="/admin" replace />;

  return (
    <div className="ssr-admin-login">
      <section className="ssr-admin-login__intro" aria-label="Painel administrativo do SSR Connect">
        <Link to="/" className="ssr-admin-login__brand" aria-label="SSR Connect — página inicial">
          <span className="ssr-admin-login__brand-mark">
            <GraduationCap aria-hidden="true" />
          </span>
          <span>
            <span className="ssr-admin-login__brand-name">SSR-CONNECT</span>
            <span className="ssr-admin-login__brand-sub">CETI Sebastião Soares Ribeiro</span>
          </span>
        </Link>

        <div className="ssr-admin-login__copy">
          <span className="ssr-admin-login__eyebrow">
            <span className="ssr-admin-login__dot" />
            Área administrativa
          </span>
          <h1 className="ssr-admin-login__title">Gestão escolar em um só lugar.</h1>
          <p className="ssr-admin-login__description">
            Acesse as ferramentas da equipe gestora com segurança e acompanhe a rotina da escola.
          </p>
        </div>

        <div className="ssr-admin-login__foot">
          Acesso exclusivo para administradores autorizados
        </div>
      </section>

      <section className="ssr-admin-login__main" aria-label="Entrar no painel">
        <div className="ssr-admin-login__wrap">
          <Link to="/" className="ssr-admin-login__brand ssr-admin-login__mobile-brand" aria-label="SSR Connect — página inicial">
            <span className="ssr-admin-login__brand-mark">
              <GraduationCap aria-hidden="true" />
            </span>
            <span>
              <span className="ssr-admin-login__brand-name">SSR-CONNECT</span>
              <span className="ssr-admin-login__brand-sub">Área administrativa</span>
            </span>
          </Link>

          <div className="ssr-admin-login__heading">
            <h2>Bem-vindo de volta</h2>
            <p>Entre com sua conta de administrador.</p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            onSubmit={submit}
            className="ssr-admin-login__card"
          >
            <div className="ssr-admin-login__field">
              <label className="ssr-admin-login__label" htmlFor="admin-email">
                E-mail do administrador
              </label>
              <div className="ssr-admin-login__input-wrap">
                <Mail className="ssr-admin-login__input-icon" aria-hidden="true" />
                <input
                  id="admin-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Digite seu e-mail"
                  className="ssr-admin-login__input"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                />
              </div>
            </div>

            <div className="ssr-admin-login__field">
              <label className="ssr-admin-login__label" htmlFor="admin-password">
                Senha
              </label>
              <div className="ssr-admin-login__input-wrap">
                <Lock className="ssr-admin-login__input-icon" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  className="ssr-admin-login__input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="ssr-admin-login__toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>

            {err && (
              <p className="ssr-admin-login__error" role="alert">
                <AlertCircle aria-hidden="true" />
                <span>{err}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="ssr-admin-login__submit"
            >
              {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
              {busy ? "Verificando acesso..." : "Entrar no painel"}
            </button>
          </motion.form>

          <div className="ssr-admin-login__secure">
            <ShieldCheck aria-hidden="true" />
            <span>Acesso protegido da equipe gestora</span>
          </div>

          <Link to="/" className="ssr-admin-login__back">
            <ArrowLeft aria-hidden="true" />
            Voltar para o início
          </Link>
        </div>
      </section>
    </div>
  );
}
