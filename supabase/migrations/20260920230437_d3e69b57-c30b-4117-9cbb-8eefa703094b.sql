-- ROLES Y PERMISOS
CREATE TYPE public.app_role AS ENUM ('admin','gerente','vendedor','almacen','contador');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  UNIQUE (role, permission)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role = ur.role
        WHERE ur.user_id = _user_id AND rp.permission = _permission
      );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- bootstrap: el primer usuario que lo solicite se vuelve admin si no existe ninguno
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE POLICY "ver roles propios o admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gestiona roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "personal ve permisos" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "admin gestiona permisos" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.role_permissions (role, permission) VALUES
 ('gerente','inventario.ver'),('gerente','inventario.editar'),
 ('gerente','compras.ver'),('gerente','compras.editar'),
 ('gerente','pos.ver'),('gerente','pos.editar'),
 ('gerente','pedidos.ver'),('gerente','pedidos.editar'),
 ('gerente','bancos.ver'),('gerente','bancos.editar'),
 ('gerente','cobrar.ver'),('gerente','cobrar.editar'),
 ('gerente','pagar.ver'),('gerente','pagar.editar'),
 ('vendedor','pos.ver'),('vendedor','pos.editar'),
 ('vendedor','pedidos.ver'),('vendedor','pedidos.editar'),
 ('vendedor','inventario.ver'),('vendedor','cobrar.ver'),
 ('almacen','inventario.ver'),('almacen','inventario.editar'),
 ('almacen','compras.ver'),('almacen','compras.editar'),('almacen','pedidos.ver'),
 ('contador','bancos.ver'),('contador','bancos.editar'),
 ('contador','cobrar.ver'),('contador','cobrar.editar'),
 ('contador','pagar.ver'),('contador','pagar.editar'),
 ('contador','compras.ver'),('contador','pos.ver');

-- TIMESTAMP TRIGGER (ya existe update_updated_at_column si no, se crea)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROVEEDORES
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver proveedores" ON public.suppliers FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'compras.ver'));
CREATE POLICY "editar proveedores" ON public.suppliers FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'compras.editar')) WITH CHECK (public.has_permission(auth.uid(),'compras.editar'));
CREATE TRIGGER suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTOS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  price numeric(12,2) NOT NULL DEFAULT 0,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo publico" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "editar productos" ON public.products FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'inventario.editar')) WITH CHECK (public.has_permission(auth.uid(),'inventario.editar'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'entrada',
  quantity integer NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver movimientos" ON public.inventory_movements FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'inventario.ver'));
CREATE POLICY "editar movimientos" ON public.inventory_movements FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'inventario.editar')) WITH CHECK (public.has_permission(auth.uid(),'inventario.editar'));

-- CUENTAS BANCARIAS
CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bank text NOT NULL,
  account_number text,
  currency text NOT NULL DEFAULT 'USD',
  balance numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver bancos" ON public.bank_accounts FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'bancos.ver'));
CREATE POLICY "editar bancos" ON public.bank_accounts FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'bancos.editar')) WITH CHECK (public.has_permission(auth.uid(),'bancos.editar'));
CREATE TRIGGER bank_accounts_updated BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'ingreso',
  amount numeric(14,2) NOT NULL,
  description text,
  occurred_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver movimientos banco" ON public.bank_transactions FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'bancos.ver'));
CREATE POLICY "editar movimientos banco" ON public.bank_transactions FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'bancos.editar')) WITH CHECK (public.has_permission(auth.uid(),'bancos.editar'));

-- COMPRAS
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  reference text,
  purchased_at date NOT NULL DEFAULT current_date,
  total numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendiente',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver compras" ON public.purchases FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'compras.ver'));
CREATE POLICY "editar compras" ON public.purchases FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'compras.editar')) WITH CHECK (public.has_permission(auth.uid(),'compras.editar'));
CREATE TRIGGER purchases_updated BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_items TO authenticated;
GRANT ALL ON public.purchase_items TO service_role;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver renglones compra" ON public.purchase_items FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'compras.ver'));
CREATE POLICY "editar renglones compra" ON public.purchase_items FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'compras.editar')) WITH CHECK (public.has_permission(auth.uid(),'compras.editar'));

-- VENTAS (POS)
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL DEFAULT 'Contado',
  sold_at timestamptz NOT NULL DEFAULT now(),
  total numeric(14,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'efectivo',
  account_id uuid REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pagada',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver ventas" ON public.sales FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'pos.ver'));
CREATE POLICY "editar ventas" ON public.sales FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'pos.editar')) WITH CHECK (public.has_permission(auth.uid(),'pos.editar'));

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT ALL ON public.sale_items TO service_role;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver renglones venta" ON public.sale_items FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'pos.ver'));
CREATE POLICY "editar renglones venta" ON public.sale_items FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'pos.editar')) WITH CHECK (public.has_permission(auth.uid(),'pos.editar'));

-- CUENTAS POR COBRAR / PAGAR
CREATE TABLE public.receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receivables TO authenticated;
GRANT ALL ON public.receivables TO service_role;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver cobrar" ON public.receivables FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'cobrar.ver'));
CREATE POLICY "editar cobrar" ON public.receivables FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'cobrar.editar')) WITH CHECK (public.has_permission(auth.uid(),'cobrar.editar'));
CREATE TRIGGER receivables_updated BEFORE UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name text NOT NULL,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payables TO authenticated;
GRANT ALL ON public.payables TO service_role;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver pagar" ON public.payables FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'pagar.ver'));
CREATE POLICY "editar pagar" ON public.payables FOR ALL TO authenticated USING (public.has_permission(auth.uid(),'pagar.editar')) WITH CHECK (public.has_permission(auth.uid(),'pagar.editar'));
CREATE TRIGGER payables_updated BEFORE UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PEDIDOS: el personal con permiso puede verlos y actualizarlos
CREATE POLICY "personal ve pedidos" ON public.orders FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'pedidos.ver'));
CREATE POLICY "personal edita pedidos" ON public.orders FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(),'pedidos.editar')) WITH CHECK (public.has_permission(auth.uid(),'pedidos.editar'));
CREATE POLICY "personal ve renglones pedido" ON public.order_items FOR SELECT TO authenticated USING (public.has_permission(auth.uid(),'pedidos.ver'));

-- catálogo inicial
INSERT INTO public.products (sku, name, category, price, cost, stock, min_stock) VALUES
 ('TEC-001','Laptop 15" Core i5 8GB','Tecnología',420.00,350.00,12,3),
 ('TEC-002','Monitor LED 24"','Tecnología',135.00,105.00,20,5),
 ('OFI-001','Silla ergonómica','Oficina',95.00,70.00,8,2),
 ('IMP-001','Tóner láser negro','Impresión',38.00,24.00,40,10),
 ('MOT-001','Kit de arrastre 428','Motores',45.00,30.00,25,6),
 ('TRA-001','Cadena de transmisión reforzada','Transmisión',28.00,18.00,30,8);