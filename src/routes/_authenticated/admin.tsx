import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MODULES, ROLE_LABEL, usePermissions, type AppRole } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel administrativo | CompuRepuestos" },
      {
        name: "description",
        content: "Gestión de inventario, compras, ventas, bancos y usuarios.",
      },
      { property: "og:title", content: "Panel administrativo | CompuRepuestos" },
      { property: "og:description", content: "Gestión interna de la tienda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { roles, isAdmin, isStaff, loading, can, refetch } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");

  const claim = async () => {
    setClaiming(true);
    setMessage("");
    const { data, error } = await supabase.rpc("claim_admin");
    setClaiming(false);
    if (error) return setMessage("No se pudo asignar el rol.");
    if (!data) return setMessage("Ya existe un administrador. Pídele que te asigne un rol.");
    await refetch();
    await queryClient.invalidateQueries();
  };

  const links = MODULES.filter((m) => can(`${m.key}.ver`));

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="font-display text-lg uppercase tracking-wide">
            CompuRepuestos
          </Link>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs uppercase tracking-wide">
            Panel
          </span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden sm:inline opacity-80">
              {roles.map((r) => ROLE_LABEL[r as AppRole] ?? r).join(", ") || "Sin rol"}
            </span>
            <Link to="/cuenta" className="underline-offset-4 hover:underline">
              Mi cuenta
            </Link>
            <button
              type="button"
              className="underline-offset-4 hover:underline"
              onClick={async () => {
                await supabase.auth.signOut();
                queryClient.clear();
                navigate({ to: "/auth" });
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row">
        <nav className="lg:w-60 shrink-0">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            <li>
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
              >
                Resumen
              </Link>
            </li>
            {links.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.path}
                  activeProps={{ className: "bg-primary text-primary-foreground" }}
                  className="block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin ? (
              <li>
                <Link
                  to="/admin/usuarios"
                  activeProps={{ className: "bg-primary text-primary-foreground" }}
                  className="block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
                >
                  Usuarios y permisos
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : isStaff ? (
            <Outlet />
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h1 className="font-display text-xl uppercase text-primary">Acceso restringido</h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Tu cuenta todavía no tiene un rol en el panel. Si eres el dueño de la tienda y aún
                no hay ningún administrador, puedes tomar ese rol ahora.
              </p>
              <Button className="mt-4" onClick={claim} disabled={claiming}>
                {claiming ? "Asignando…" : "Convertirme en administrador"}
              </Button>
              {message ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
