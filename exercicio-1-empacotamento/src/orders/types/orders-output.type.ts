export type OrdersOutput = {
  pedidos: Array<{
    pedido_id: number;
    caixas: Array<{
      caixa_id: string | null;
      produtos: string[];
      observacao?: string;
    }>;
  }>;
};
