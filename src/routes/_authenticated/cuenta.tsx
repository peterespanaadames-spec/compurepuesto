import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta | CompuRepuestos" },
      {
        name: "description",
        content: "Revisa tu historial de compras y actualiza tus datos personales.",
      },
      { property: "og:title", content: "Mi cuenta | CompuRepuestos" },
      { property: "og:description", content: "Historial de compras y datos personales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type Profile = { full_name: string; phone: string; address: string };

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Profile>({ full_name: "", phone: "", address: "" });
  const [saved, setSaved] = useState("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        profile: (data ?? { full_name: "", phone: "", address: "" }) as Profile,
        email: auth.user?.email ?? "",
      };
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, order_items (product_name, quantity, unit_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (profileQuery.data) setForm(profileQuery.data.profile);
  }, [profileQuery.data]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({ id: auth.user!.id, ...form });
    setSaved(error ? "No pudimos guardar tus datos." : "Datos actualizados.");
    if (!error) queryClient.invalidateQueries({ queryKey: ["profile"] });
    window.setTimeout(() => setSaved(""), 2500);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full border-4 border-primary bg-background font-display text-lg text-destructive">
              CR
            </span>
            <span className="hidden font-display text-lg text-primary sm:block">
              Compu<span className="text-destructive">Repuestos</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="small">
                Seguir comprando
              </Button>
            </Link>
            <Button variant="ghost" size="small" onClick={signOut}>
              <LogOut className="size-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-md border border-border bg-card p-6">
          <h1 className="font-display text-2xl text-primary">Mis datos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profileQuery.data?.email}</p>
          <form className="mt-5 space-y-4" onSubmit={saveProfile}>
            <Field
              label="Nombre y apellido"
              value={form.full_name}
              onChange={(v) => setForm({ ...form, full_name: v })}
            />
            <Field
              label="Teléfono"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <Field
              label="Dirección de entrega"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
            />
            {saved && <p className="text-sm font-semibold text-primary">{saved}</p>}
            <Button type="submit" className="w-full">
              Guardar cambios
            </Button>
          </form>
        </section>

        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-2xl text-primary">Historial de compras</h2>
          {ordersQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Cargando tus pedidos...</p>
          ) : ordersQuery.data?.length ? (
            <ul className="mt-5 space-y-4">
              {ordersQuery.data.map((order) => (
                <li key={order.id} className="rounded-sm border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-card-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <span className="rounded-sm bg-muted px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
                      {order.status}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {order.order_items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-3">
                        <span>
                          {item.quantity} × {item.product_name}
                        </span>
                        <span>${Number(item.unit_price) * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-border pt-2 text-right font-display text-lg text-primary">
                    Total ${Number(order.total)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <PackageCheck className="mx-auto size-9 text-muted-foreground" />
              <p className="mt-3 font-semibold">Todavía no tienes compras registradas.</p>
              <Link to="/">
                <Button variant="outline" className="mt-4">
                  Ver productos
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}
