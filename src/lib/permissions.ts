import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const MODULES = [
  { key: "inventario", label: "Inventario", path: "/admin/inventario" },
  { key: "compras", label: "Compras", path: "/admin/compras" },
  { key: "pos", label: "Punto de venta", path: "/admin/pos" },
  { key: "pedidos", label: "Pedidos", path: "/admin/pedidos" },
  { key: "bancos", label: "Cuentas bancarias", path: "/admin/bancos" },
  { key: "cobrar", label: "Cuentas por cobrar", path: "/admin/cobrar" },
  { key: "pagar", label: "Cuentas por pagar", path: "/admin/pagar" },
] as const;

export const ALL_PERMISSIONS = MODULES.flatMap((m) => [`${m.key}.ver`, `${m.key}.editar`]);

export const ROLES = ["admin", "gerente", "vendedor", "almacen", "contador"] as const;
export type AppRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  almacen: "Almacén",
  contador: "Contador",
};

export function usePermissions() {
  const query = useQuery({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return { roles: [] as string[], perms: [] as string[] };

      const { data: roleRows, error } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (error) throw error;
      const roles = (roleRows ?? []).map((r) => r.role as string);

      if (roles.includes("admin")) return { roles, perms: ALL_PERMISSIONS };
      if (roles.length === 0) return { roles, perms: [] as string[] };

      const { data: permRows } = await supabase
        .from("role_permissions")
        .select("permission")
        .in("role", roles as AppRole[]);
      return { roles, perms: [...new Set((permRows ?? []).map((r) => r.permission))] };
    },
  });

  const perms = query.data?.perms ?? [];
  const roles = query.data?.roles ?? [];

  return {
    roles,
    perms,
    loading: query.isLoading,
    isAdmin: roles.includes("admin"),
    isStaff: roles.length > 0,
    can: (permission: string) => perms.includes(permission),
    refetch: query.refetch,
  };
}

export const money = (value: number | string | null | undefined) =>
  `$${Number(value ?? 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const shortDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }) : "—";
