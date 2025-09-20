import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersServiceMock = {
    create: jest.fn().mockImplementation((dto) => ({
      pedidos: dto.pedidos.map((p) => ({ pedido_id: p.pedido_id, caixas: [] })),
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersServiceMock }],
    })

      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST /orders: deve delegar para OrdersService.create e retornar resultado', async () => {
    const dto = {
      pedidos: [
        {
          pedido_id: 1,
          produtos: [
            {
              produto_id: 'X',
              dimensoes: { altura: 1, largura: 1, comprimento: 1 },
            },
          ],
        },
      ],
    } as any;

    const res = await controller.create(dto);

    expect(ordersServiceMock.create).toHaveBeenCalledTimes(1);
    expect(ordersServiceMock.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ pedidos: [{ pedido_id: 1, caixas: [] }] });
  });
});
