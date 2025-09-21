import { ApiProperty } from '@nestjs/swagger';

export class CaixaResponseDto {
  @ApiProperty({
    example: 'Caixa 2',
    nullable: true,
    description:
      'Identificador da caixa usada. Nulo caso não exista caixa disponível.',
  })
  caixa_id: string | null;

  @ApiProperty({
    example: ['PS5', 'Volante'],
    description: 'Lista de produtos que foram alocados nesta caixa',
  })
  produtos: string[];

  @ApiProperty({
    example: 'Quando houver observações, este campo virá preenchido.',
    required: false,
    description: 'Observação adicional, caso o produto não tenha sido alocado',
  })
  observacao?: string;
}

export class PedidoResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do pedido',
  })
  pedido_id: number;

  @ApiProperty({
    type: () => [CaixaResponseDto],
    description: 'Caixas utilizadas para embalar os produtos deste pedido',
  })
  caixas: CaixaResponseDto[];
}

export class OrderResponseDto {
  @ApiProperty({
    type: () => [PedidoResponseDto],
    description: 'Lista de pedidos processados e suas respectivas caixas',
  })
  pedidos: PedidoResponseDto[];
}
