import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      exemplo1: {
        summary: 'Exemplo de pedido com dois produtos',
        value: {
          pedidos: [
            {
              pedido_id: 1,
              produtos: [
                {
                  produto_id: 'PS5',
                  dimensoes: { altura: 40, largura: 10, comprimento: 25 },
                },
                {
                  produto_id: 'Volante',
                  dimensoes: { altura: 40, largura: 30, comprimento: 30 },
                },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pedidos processados e embalados em caixas',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos no corpo da requisição',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @ApiOperation({ summary: 'Criar novo pedido e calcular embalagens' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
}
