import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Panel, Stat, Empty, DataTable, Row, Cell } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, usePermissions } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { can } = usePermissions();

  const summary = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const [products, sales, receivables, payables, banks] = await Promise.all([
        supabase.from("products").select("id, name, stock, min_stock, price"),
        supabase.from("sales").select("id, total, customer_name, sold_at").order("sold_at", { ascending: false }).limit(5),
        supabase.from("receivables").select("amount, paid_amount"),
        supabase.from("payables").select("amount, paid_amount"),
        supabase.from("bank_accounts").select("balance"),
      ]);
      return {
        products: products.data ?? [],
        sales: sales.data ?? [],
        receivables: receivables.data ?? [],
        payables: payables.data ?? [],
        banks: banks.data ?? [],
      };
    },
  });

  const data = summary.data;
  const lowStock = (data?.products ?? []).filter((p) => p.stock <= p.min_stock);
  const totalSales = (data?.sales ?? []).reduce((sum, s) => sum + Number(s.total), 0);
  const porCobrar = (data?.receivables ?? []).reduce((sum, r) => sum + (Number(r.amount) - Number(r.paid_amount)), 0);
  const porPagar = (data?.payables ?? []).reduce((sum, r) => sum + (Number(r.amount) - Number(r.paid_amount)), 0);
  const enBancos = (data?.banks ?? []).reduce((sum, b) => sum + Number(b.balance), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen" subtitle="Estado general del negocio" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can("inventario.ver") ? <Stat label="Productos" value={String(data?.products.length ?? 0)} /> : null}
        {can("inventario.ver") ? (
          <Stat label="Bajo mínimo" value={String(lowStock.length)} tone={lowStock.length ? "danger" : "default"} />
        ) : null}
        {can("bancos.ver") ? <Stat label="Saldo en bancos" value={money(enBancos)} /> : null}
        {can("pos.ver") ? <Stat label="Últimas ventas" value={money(totalSales)} /> : null}
        {can("cobrar.ver") ? <Stat label="Por cobrar" value={money(porCobrar)} /> : null}
        {can("pagar.ver") ? <Stat label="Por pagar" value={money(porPagar)} tone="danger" /> : null}
      </div>

      {can("pos.ver") ? (
        <Panel title="Ventas recientes">
          {data?.sales.length ? (
            <DataTable head={["Cliente", "Fecha", "Total"]}>
              {data.sales.map((sale) => (
                <Row key={sale.id}>
                  <Cell>{sale.customer_name}</Cell>
                  <Cell>{shortDate(sale.sold_at)}</Cell>
                  <Cell className="font-semibold">{money(sale.total)}</Cell>
                </Row>
              ))}
            </DataTable>
          ) : (
            <Empty text="Todavía no hay ventas registradas." />
          )}
        </Panel>
      ) : null}

      {can("inventario.ver") && lowStock.length ? (
        <Panel title="Productos por reponer">
          <DataTable head={["Producto", "Existencia", "Mínimo"]}>
            {lowStock.map((p) => (
              <Row key={p.id}>
                <Cell>{p.name}</Cell>
                <Cell className="text-destructive font-semibold">{p.stock}</Cell>
                <Cell>{p.min_stock}</Cell>
              </Row>
            ))}
          </DataTable>
        </Panel>
      ) : null}
    </div>
  );
}
