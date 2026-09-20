import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Menu,
  MessageCircle,
  PackageCheck,
  Search,
  ShoppingCart,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import motoBanner from "@/assets/moto-banner.jpg";
import laptopImage from "@/assets/product-laptop.jpg";
import printerImage from "@/assets/product-printer.jpg";
import shocksImage from "@/assets/product-shocks.jpg";
import clutchImage from "@/assets/product-clutch.jpg";
import techBanner from "@/assets/tech-banner.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CompuRepuestos | Tecnología y repuestos de motos" },
      {
        name: "description",
        content: "Tecnología, artículos de oficina y repuestos de motos con entrega local en Venezuela.",
      },
      { property: "og:title", content: "CompuRepuestos | Todo para tu oficina y tu moto" },
      {
        property: "og:description",
        content: "Compra equipos, suministros y repuestos con asesoría y entrega local.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = ["Todos", "Tecnología", "Oficina", "Impresión", "Motores", "Transmisión"];

const products = [
  { name: "Laptop Core i5 15.6 pulgadas", category: "Tecnología", price: 529, image: laptopImage, tag: "Oferta" },
  { name: "Amortiguadores Racing 320 mm", category: "Motores", price: 89, image: shocksImage, tag: "Nuevo" },
  { name: "Impresora láser monocromática", category: "Impresión", price: 175, image: printerImage },
  { name: "Kit de clutch reforzado 200 cc", category: "Transmisión", price: 64, image: clutchImage },
];

function Brand() {
  return (
    <a href="/" className="flex items-center gap-2" aria-label="CompuRepuestos, inicio">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border-4 border-primary bg-background font-display text-xl text-destructive shadow-sm">
        CR
      </span>
      <span className="hidden font-display text-xl text-primary sm:block">
        Compu<span className="text-destructive">Repuestos</span>
      </span>
    </a>
  );
}

type CartLine = { name: string; category: string; price: number; quantity: number };

function Index() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [notice, setNotice] = useState("");

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce((total, line) => total + line.quantity * line.price, 0);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (category === "Todos" || product.category === category) &&
        (!normalized || product.name.toLowerCase().includes(normalized) || product.category.toLowerCase().includes(normalized)),
    );
  }, [category, query]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function addToCart(product: (typeof products)[number]) {
    setCart((lines) => {
      const existing = lines.find((line) => line.name === product.name);
      if (existing) {
        return lines.map((line) => (line.name === product.name ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...lines, { name: product.name, category: product.category, price: product.price, quantity: 1 }];
    });
    showNotice(`${product.name} agregado al carrito`);
  }

  function removeFromCart(name: string) {
    setCart((lines) => lines.filter((line) => line.name !== name));
  }

  async function checkout() {
    if (!cart.length) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setCheckingOut(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total: cartTotal, status: "pendiente" })
      .select("id")
      .single();

    if (error || !order) {
      setCheckingOut(false);
      showNotice("No pudimos registrar tu pedido. Intenta de nuevo.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      cart.map((line) => ({
        order_id: order.id,
        product_name: line.name,
        category: line.category,
        unit_price: line.price,
        quantity: line.quantity,
      })),
    );

    setCheckingOut(false);
    if (itemsError) {
      showNotice("No pudimos registrar tu pedido. Intenta de nuevo.");
      return;
    }
    setCart([]);
    setCartOpen(false);
    navigate({ to: "/cuenta" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
        Envíos nacionales · Entrega local · Atención personalizada
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
          <Brand />
          <label className="relative mx-auto hidden w-full max-w-xl md:block">
            <span className="sr-only">Buscar productos</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="¿Qué estás buscando?"
              className="h-11 w-full rounded-sm border border-input bg-muted/60 pl-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
          </label>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to={user ? "/cuenta" : "/auth"} className="flex items-center">
              <Button variant="ghost" size="small" aria-label={user ? "Mi cuenta" : "Ingresar o registrarme"}>
                <UserRound className="size-5" />
                <span className="hidden sm:inline">{user ? "Mi cuenta" : "Ingresar"}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Carrito con ${cartCount} productos`} onClick={() => setCartOpen((open) => !open)}>
              <ShoppingCart className="size-5" />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{cartCount}</span>}
            </Button>
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <label className="relative block">
            <span className="sr-only">Buscar productos</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos..." className="h-10 w-full rounded-sm border border-input bg-muted/60 pl-3 pr-10 text-sm outline-none focus:border-primary" />
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
          </label>
        </div>
      </header>

      <main>
        <section className="relative grid min-h-[430px] grid-cols-1 overflow-hidden lg:grid-cols-2">
          <article className="group relative min-h-[330px] overflow-hidden bg-muted">
            <img src={techBanner} alt="Equipos de computación y artículos de oficina" width={1200} height={656} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-hero-tech" />
            <div className="relative z-10 flex h-full min-h-[330px] max-w-xl flex-col items-start justify-end p-8 sm:p-12">
              <p className="mb-2 text-xs font-bold uppercase text-primary">Tecnología y oficina</p>
              <h1 className="max-w-sm font-display text-4xl leading-[1.05] text-primary sm:text-5xl">Todo para avanzar</h1>
              <p className="mt-3 max-w-sm text-base text-foreground/75">Computación, impresión y suministros para hacer más cada día.</p>
              <Button className="mt-6" onClick={() => setCategory("Tecnología")}>Ver tecnología <ChevronRight className="size-4" /></Button>
            </div>
          </article>

          <article className="group relative min-h-[330px] overflow-hidden bg-foreground">
            <img src={motoBanner} alt="Motor y repuestos para motocicletas" width={1200} height={656} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-hero-moto" />
            <div className="relative z-10 flex h-full min-h-[330px] max-w-xl flex-col items-start justify-end p-8 sm:p-12">
              <p className="mb-2 text-xs font-bold uppercase text-destructive-foreground/70">Repuestos de motos</p>
              <h2 className="max-w-md font-display text-4xl leading-[1.05] text-destructive-foreground sm:text-5xl">Potencia que responde</h2>
              <p className="mt-3 max-w-sm text-base text-destructive-foreground/75">Componentes confiables para mantener tu moto siempre en movimiento.</p>
              <Button variant="danger" className="mt-6" onClick={() => setCategory("Motores")}>Comprar repuestos <ChevronRight className="size-4" /></Button>
            </div>
          </article>
          <Button variant="outline" size="icon" className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full lg:inline-flex" aria-label="Promoción anterior"><ChevronLeft className="size-5" /></Button>
          <Button variant="outline" size="icon" className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full lg:inline-flex" aria-label="Siguiente promoción"><ChevronRight className="size-5" /></Button>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            {categories.map((item) => (
              <Button key={item} size="small" variant={category === item ? "primary" : "outline"} className="rounded-full" onClick={() => setCategory(item)}>{item}</Button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-destructive">Selección recomendada</p>
              <h2 className="mt-1 font-display text-3xl text-primary">Productos destacados</h2>
            </div>
            <button className="hidden text-sm font-semibold text-primary underline-offset-4 hover:underline sm:block" onClick={() => { setCategory("Todos"); setQuery(""); }}>Ver todo</button>
          </div>

          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <article key={product.name} className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card transition hover:-translate-y-1 hover:shadow-product">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img src={product.image} alt={product.name} width={816} height={816} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    {product.tag && <span className="absolute left-3 top-3 rounded-sm bg-destructive px-2 py-1 text-[10px] font-bold uppercase text-destructive-foreground">{product.tag}</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">{product.category}</p>
                    <h3 className="mt-1 min-h-10 text-sm font-semibold leading-tight text-card-foreground sm:text-base">{product.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="font-display text-lg text-primary">${product.price}</span>
                      <Button size="icon" variant="danger" className="size-9" onClick={() => addToCart(product)} aria-label={`Agregar ${product.name} al carrito`}><ShoppingCart className="size-4" /></Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-y border-border py-16 text-center">
              <PackageCheck className="mx-auto size-9 text-muted-foreground" />
              <p className="mt-3 font-semibold">No encontramos productos con esa búsqueda.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setCategory("Todos"); setQuery(""); }}>Limpiar búsqueda</Button>
            </div>
          )}
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-px bg-primary-foreground/15 sm:grid-cols-3">
            {[
              [Truck, "Entrega local", "Recibe tu compra de forma rápida y segura."],
              [Wrench, "Asesoría experta", "Te ayudamos a elegir la pieza correcta."],
              [Headphones, "Atención directa", "Resolvemos tus dudas antes de comprar."],
            ].map(([Icon, title, text]) => {
              const ServiceIcon = Icon as typeof Truck;
              return <div key={String(title)} className="flex items-center gap-4 bg-primary px-6 py-7"><ServiceIcon className="size-8 shrink-0 text-destructive" /><div><h3 className="font-display text-base">{String(title)}</h3><p className="mt-1 text-sm text-primary-foreground/65">{String(text)}</p></div></div>;
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Brand />
          <p className="text-sm text-muted-foreground">Tecnología, oficina y repuestos en un solo lugar.</p>
        </div>
      </footer>

      <a href="https://wa.me/584120000000" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-floating transition hover:-translate-y-1" aria-label="Contactar por WhatsApp">
        <MessageCircle className="size-7" />
      </a>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40" role="dialog" aria-label="Carrito de compras" onClick={() => setCartOpen(false)}>
          <aside className="flex h-full w-full max-w-sm flex-col bg-background p-6 shadow-floating" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-primary">Tu carrito</h2>
              <Button variant="ghost" size="small" onClick={() => setCartOpen(false)}>Cerrar</Button>
            </div>
            {cart.length ? (
              <>
                <ul className="mt-5 flex-1 space-y-3 overflow-y-auto">
                  {cart.map((line) => (
                    <li key={line.name} className="flex items-start justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <p className="text-sm font-semibold">{line.name}</p>
                        <p className="text-xs text-muted-foreground">{line.quantity} × ${line.price}</p>
                      </div>
                      <button className="text-xs font-semibold text-destructive" onClick={() => removeFromCart(line.name)}>Quitar</button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-semibold text-muted-foreground">Total</span>
                  <span className="font-display text-2xl text-primary">${cartTotal}</span>
                </div>
                <Button className="mt-4 w-full" onClick={checkout} disabled={checkingOut}>
                  {checkingOut ? "Registrando pedido..." : user ? "Finalizar compra" : "Ingresar para comprar"}
                </Button>
              </>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">Tu carrito está vacío.</p>
            )}
          </aside>
        </div>
      )}

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-floating">{notice}</div>}
    </div>
  );
}