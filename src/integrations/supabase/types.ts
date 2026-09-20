export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string | null;
          balance: number;
          bank: string;
          created_at: string;
          currency: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          account_number?: string | null;
          balance?: number;
          bank: string;
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          account_number?: string | null;
          balance?: number;
          bank?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bank_transactions: {
        Row: {
          account_id: string;
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          kind: string;
          occurred_at: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          kind?: string;
          occurred_at?: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          kind?: string;
          occurred_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          kind: string;
          product_id: string;
          quantity: number;
          reason: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          kind?: string;
          product_id: string;
          quantity: number;
          reason?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          kind?: string;
          product_id?: string;
          quantity?: number;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          order_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          order_id: string;
          product_name: string;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          order_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          status: string;
          total: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          status?: string;
          total?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: string;
          total?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      payables: {
        Row: {
          amount: number;
          created_at: string;
          due_date: string | null;
          id: string;
          paid_amount: number;
          purchase_id: string | null;
          status: string;
          supplier_id: string | null;
          supplier_name: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          paid_amount?: number;
          purchase_id?: string | null;
          status?: string;
          supplier_id?: string | null;
          supplier_name: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          paid_amount?: number;
          purchase_id?: string | null;
          status?: string;
          supplier_id?: string | null;
          supplier_name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payables_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payables_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          active: boolean;
          category: string;
          cost: number;
          created_at: string;
          id: string;
          min_stock: number;
          name: string;
          price: number;
          sku: string | null;
          stock: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          category?: string;
          cost?: number;
          created_at?: string;
          id?: string;
          min_stock?: number;
          name: string;
          price?: number;
          sku?: string | null;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          category?: string;
          cost?: number;
          created_at?: string;
          id?: string;
          min_stock?: number;
          name?: string;
          price?: number;
          sku?: string | null;
          stock?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string;
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          created_at?: string;
          full_name?: string;
          id: string;
          phone?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string | null;
          product_name: string;
          purchase_id: string;
          quantity: number;
          unit_cost: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id?: string | null;
          product_name: string;
          purchase_id: string;
          quantity?: number;
          unit_cost?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string | null;
          product_name?: string;
          purchase_id?: string;
          quantity?: number;
          unit_cost?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          purchased_at: string;
          reference: string | null;
          status: string;
          supplier_id: string | null;
          total: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          purchased_at?: string;
          reference?: string | null;
          status?: string;
          supplier_id?: string | null;
          total?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          purchased_at?: string;
          reference?: string | null;
          status?: string;
          supplier_id?: string | null;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      receivables: {
        Row: {
          amount: number;
          created_at: string;
          customer_name: string;
          due_date: string | null;
          id: string;
          paid_amount: number;
          sale_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          customer_name: string;
          due_date?: string | null;
          id?: string;
          paid_amount?: number;
          sale_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          customer_name?: string;
          due_date?: string | null;
          id?: string;
          paid_amount?: number;
          sale_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receivables_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: string;
          permission: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          id?: string;
          permission: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          id?: string;
          permission?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      sale_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          sale_id: string;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          sale_id: string;
          unit_price?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          sale_id?: string;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          account_id: string | null;
          created_at: string;
          created_by: string | null;
          customer_name: string;
          id: string;
          payment_method: string;
          sold_at: string;
          status: string;
          total: number;
        };
        Insert: {
          account_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          customer_name?: string;
          id?: string;
          payment_method?: string;
          sold_at?: string;
          status?: string;
          total?: number;
        };
        Update: {
          account_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          customer_name?: string;
          id?: string;
          payment_method?: string;
          sold_at?: string;
          status?: string;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sales_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          address: string | null;
          contact: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          contact?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          contact?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_admin: { Args: never; Returns: boolean };
      has_permission: {
        Args: { _permission: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "gerente" | "vendedor" | "almacen" | "contador";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "vendedor", "almacen", "contador"],
    },
  },
} as const;
