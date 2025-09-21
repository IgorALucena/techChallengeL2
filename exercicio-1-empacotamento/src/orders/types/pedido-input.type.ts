export type PedidoInput = {
  pedido_id: number;
  produtos: {
    produto_id: string;
    dimensoes: { altura: number; largura: number; comprimento: number };
  }[];
};
