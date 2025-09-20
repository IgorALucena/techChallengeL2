import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('deve empacotar exatamente como esperado (golden test)', () => {
    const input = {
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
        {
          pedido_id: 2,
          produtos: [
            {
              produto_id: 'Joystick',
              dimensoes: { altura: 15, largura: 20, comprimento: 10 },
            },
            {
              produto_id: 'Fifa 24',
              dimensoes: { altura: 10, largura: 30, comprimento: 10 },
            },
            {
              produto_id: 'Call of Duty',
              dimensoes: { altura: 30, largura: 15, comprimento: 10 },
            },
          ],
        },
        {
          pedido_id: 3,
          produtos: [
            {
              produto_id: 'Headset',
              dimensoes: { altura: 25, largura: 15, comprimento: 20 },
            },
          ],
        },
        {
          pedido_id: 4,
          produtos: [
            {
              produto_id: 'Mouse Gamer',
              dimensoes: { altura: 5, largura: 8, comprimento: 12 },
            },
            {
              produto_id: 'Teclado Mecânico',
              dimensoes: { altura: 4, largura: 45, comprimento: 15 },
            },
          ],
        },
        {
          pedido_id: 5,
          produtos: [
            {
              produto_id: 'Cadeira Gamer',
              dimensoes: { altura: 120, largura: 60, comprimento: 70 },
            },
          ],
        },
        {
          pedido_id: 6,
          produtos: [
            {
              produto_id: 'Webcam',
              dimensoes: { altura: 7, largura: 10, comprimento: 5 },
            },
            {
              produto_id: 'Microfone',
              dimensoes: { altura: 25, largura: 10, comprimento: 10 },
            },
            {
              produto_id: 'Monitor',
              dimensoes: { altura: 50, largura: 60, comprimento: 20 },
            },
            {
              produto_id: 'Notebook',
              dimensoes: { altura: 2, largura: 35, comprimento: 25 },
            },
          ],
        },
        {
          pedido_id: 7,
          produtos: [
            {
              produto_id: 'Jogo de Cabos',
              dimensoes: { altura: 5, largura: 15, comprimento: 10 },
            },
          ],
        },
        {
          pedido_id: 8,
          produtos: [
            {
              produto_id: 'Controle Xbox',
              dimensoes: { altura: 10, largura: 15, comprimento: 10 },
            },
            {
              produto_id: 'Carregador',
              dimensoes: { altura: 3, largura: 8, comprimento: 8 },
            },
          ],
        },
        {
          pedido_id: 9,
          produtos: [
            {
              produto_id: 'Tablet',
              dimensoes: { altura: 1, largura: 25, comprimento: 17 },
            },
          ],
        },
        {
          pedido_id: 10,
          produtos: [
            {
              produto_id: 'HD Externo',
              dimensoes: { altura: 2, largura: 8, comprimento: 12 },
            },
            {
              produto_id: 'Pendrive',
              dimensoes: { altura: 1, largura: 2, comprimento: 5 },
            },
          ],
        },
      ],
    };

    const expected = {
      pedidos: [
        {
          pedido_id: 1,
          caixas: [{ caixa_id: 'Caixa 2', produtos: ['PS5', 'Volante'] }],
        },
        {
          pedido_id: 2,
          caixas: [
            {
              caixa_id: 'Caixa 1',
              produtos: ['Joystick', 'Fifa 24', 'Call of Duty'],
            },
          ],
        },
        {
          pedido_id: 3,
          caixas: [{ caixa_id: 'Caixa 1', produtos: ['Headset'] }],
        },
        {
          pedido_id: 4,
          caixas: [
            {
              caixa_id: 'Caixa 1',
              produtos: ['Mouse Gamer', 'Teclado Mecânico'],
            },
          ],
        },
        {
          pedido_id: 5,
          caixas: [
            {
              caixa_id: null,
              produtos: ['Cadeira Gamer'],
              observacao: 'Produto não cabe em nenhuma caixa disponível.',
            },
          ],
        },
        {
          pedido_id: 6,
          caixas: [
            { caixa_id: 'Caixa 3', produtos: ['Monitor', 'Notebook'] },
            { caixa_id: 'Caixa 1', produtos: ['Webcam', 'Microfone'] },
          ],
        },
        {
          pedido_id: 7,
          caixas: [{ caixa_id: 'Caixa 1', produtos: ['Jogo de Cabos'] }],
        },
        {
          pedido_id: 8,
          caixas: [
            { caixa_id: 'Caixa 1', produtos: ['Controle Xbox', 'Carregador'] },
          ],
        },
        {
          pedido_id: 9,
          caixas: [{ caixa_id: 'Caixa 1', produtos: ['Tablet'] }],
        },
        {
          pedido_id: 10,
          caixas: [
            { caixa_id: 'Caixa 1', produtos: ['HD Externo', 'Pendrive'] },
          ],
        },
      ],
    };

    const result = service.create(input as any);
    expect(result).toEqual(expected);
  });
});
