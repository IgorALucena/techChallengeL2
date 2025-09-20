import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DimensoesDto {
  @ApiProperty({
    example: 40,
    description: 'Altura do produto em centímetros',
  })
  @IsNumber()
  altura: number;

  @ApiProperty({
    example: 10,
    description: 'Largura do produto em centímetros',
  })
  @IsNumber()
  largura: number;

  @ApiProperty({
    example: 25,
    description: 'Comprimento do produto em centímetros',
  })
  @IsNumber()
  comprimento: number;
}

class ProdutoDto {
  @ApiProperty({
    example: 'PS5',
    description: 'Identificador ou nome do produto',
  })
  @IsString()
  produto_id: string;

  @ApiProperty({
    type: () => DimensoesDto,
    description: 'Dimensões físicas do produto',
  })
  @ValidateNested()
  @Type(() => DimensoesDto)
  dimensoes: DimensoesDto;
}

class PedidoDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do pedido',
  })
  @IsNumber()
  pedido_id: number;

  @ApiProperty({
    type: () => [ProdutoDto],
    description: 'Lista de produtos pertencentes ao pedido',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoDto)
  produtos: ProdutoDto[];
}

export class CreateOrderDto {
  @ApiProperty({
    type: () => [PedidoDto],
    description: 'Lista de pedidos a serem processados',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoDto)
  pedidos: PedidoDto[];
}
