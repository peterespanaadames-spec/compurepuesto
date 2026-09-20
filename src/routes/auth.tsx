import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Crear cuenta o ingresar | CompuRepuestos" },
      {
        name: "description",
        content:
          "Crea tu cuenta de CompuRepuestos para seguir tus compras y guardar tus datos de entrega.",
      },
      { property: "og:title", content: "Tu cuenta en CompuRepuestos" },
      {
        property: "og:description",
        content: "Regístrate para ver tu historial de compras y comprar más rápido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/cuenta", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/cuenta`,
          data: { full_name: fullName, phone, address },
        },
      });
      setBusy(false);
      if (signUpError) {
        setError(traducir(signUpError.message));
        return;
      }
      setInfo("Te enviamos un correo de confirmación. Ábrelo para activar tu cuenta.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(traducir(signInError.message));
      return;
    }
    navigate({ to: "/cuenta", replace: true });
  }

  async function handleGoogle() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("No pudimos conectar con Google. Intenta de nuevo.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/cuenta", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-11 place-items-center rounded-full border-4 border-primary bg-background font-display text-xl text-destructive">
            CR
          </span>
          <span className="font-display text-xl text-primary">
            Compu<span className="text-destructive">Repuestos</span>
          </span>
        </Link>

        <div className="rounded-md border border-border bg-card p-6 shadow-product sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-sm bg-muted p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                  setInfo("");
                }}
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  mode === item ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                {item === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl text-primary">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Ingresa para ver tu historial de compras."
              : "Regístrate para comprar más rápido y seguir tus pedidos."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <Field label="Nombre y apellido" value={fullName} onChange={setFullName} required />
                <Field label="Teléfono" value={phone} onChange={setPhone} type="tel" required />
                <Field
                  label="Dirección de entrega"
                  value={address}
                  onChange={setAddress}
                  required
                />
              </>
            )}
            <Field
              label="Correo electrónico"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />
            <Field
              label="Contraseña"
              value={password}
              onChange={setPassword}
              type="password"
              required
            />

            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
            {info && <p className="text-sm font-semibold text-primary">{info}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear mi cuenta"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
            Continuar con Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-semibold text-primary underline-offset-4 hover:underline">
            Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}

function traducir(message: string) {
  if (message.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (message.includes("Email not confirmed")) return "Confirma tu correo antes de ingresar.";
  if (message.includes("already registered"))
    return "Ese correo ya tiene una cuenta. Intenta ingresar.";
  if (message.includes("Password should be"))
    return "La contraseña debe tener al menos 6 caracteres.";
  return "No pudimos completar la operación. Intenta de nuevo.";
}
