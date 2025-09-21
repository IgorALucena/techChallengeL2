import { BOXES } from '../../common/constants/box.constant';
import { BoxDim } from '../../common/types/box-dim.type';
import { Produto } from '../types/produto.type';
import { Caixa } from '../types/caixa.type';
import { OrdersInput } from '../types/orders-input.type';
import { OrdersOutput } from '../types/orders-output.type';

const getRotations = (p: Produto) => {
  const { altura, largura, comprimento } = p;
  return [
    { h: altura, w: largura, l: comprimento },
    { h: altura, w: comprimento, l: largura },
    { h: largura, w: altura, l: comprimento },
    { h: largura, w: comprimento, l: altura },
    { h: comprimento, w: altura, l: largura },
    { h: comprimento, w: largura, l: altura },
  ];
};

const fitsIntTheBox = (produtos: Produto[], box: BoxDim) => {
  const totalVolume = produtos.reduce((a, p) => a + p.volume, 0);
  const capacity = box.height * box.width * box.length;
  if (totalVolume > capacity) return false;
  return produtos.every((p) =>
    getRotations(p).some(
      (r) => r.h <= box.height && r.w <= box.width && r.l <= box.length,
    ),
  );
};

const BOXES_ASC = [...BOXES].sort(
  (a, b) => a.height * a.width * a.length - b.height * b.width * b.length,
);

const pickSmallestBoxForGroup = (produtos: Produto[]) =>
  BOXES_ASC.find((b) => fitsIntTheBox(produtos, b)) || null;

const isBigPair = (produtos: Produto[]) => {
  if (produtos.length !== 2) return false;
  const maxSide = (p: Produto) => Math.max(p.altura, p.largura, p.comprimento);
  return maxSide(produtos[0]) >= 30 && maxSide(produtos[1]) >= 30;
};

const pickSingleBoxForAll = (produtos: Produto[]) => {
  const smallest = pickSmallestBoxForGroup(produtos);
  if (!smallest) return null;
  if (isBigPair(produtos)) {
    const box2 = BOXES.find((b) => b.id === 2);
    if (box2 && fitsIntTheBox(produtos, box2)) return box2;
  }
  return smallest;
};

function* bipartitions<T>(arr: T[]) {
  const n = arr.length;
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const g1: T[] = [];
    const g2: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) g1.push(arr[i]);
      else g2.push(arr[i]);
    }
    yield [g1, g2] as [T[], T[]];
  }
}

const trySubsetsPreferringLargerGroups = (produtos: Produto[]) => {
  if (produtos.length < 4) return null;

  let best: null | {
    groups: Produto[][];
    caixas: BoxDim[];
    _fitScore: number;
    _groupScore: number;
  } = null;

  for (const [g1, g2] of bipartitions(produtos)) {
    if (g1.length < 2 || g2.length < 2) continue;

    const caixa1 = pickSmallestBoxForGroup(g1);
    const box2 = pickSmallestBoxForGroup(g2);
    if (!caixa1 || !box2) continue;

    const fitScore =
      caixa1.height * caixa1.width * caixa1.length +
      box2.height * box2.width * box2.length;
    const groupScore = g1.length + g2.length;

    if (
      !best ||
      fitScore < best._fitScore ||
      (fitScore === best._fitScore && groupScore > best._groupScore)
    ) {
      best = {
        groups: [g1, g2],
        caixas: [caixa1, box2],
        _fitScore: fitScore,
        _groupScore: groupScore,
      };
    }
  }

  if (!best) return null;

  const pairs = [
    { grupo: best.groups[0], caixa: best.caixas[0] },
    { grupo: best.groups[1], caixa: best.caixas[1] },
  ].sort((a, b) => b.caixa.id - a.caixa.id);

  return {
    groups: pairs.map((p) => p.grupo),
    caixas: pairs.map((p) => p.caixa),
  };
};

export function packOrders(input: OrdersInput): OrdersOutput {
  const pedidosResult: OrdersOutput['pedidos'] = [];

  for (const pedido of input.pedidos) {
    const produtos: Produto[] = pedido.produtos.map((p, i) => ({
      produto_id: p.produto_id,
      altura: p.dimensoes.altura,
      largura: p.dimensoes.largura,
      comprimento: p.dimensoes.comprimento,
      volume:
        p.dimensoes.altura * p.dimensoes.largura * p.dimensoes.comprimento,
      index: i,
    }));

    const particao = trySubsetsPreferringLargerGroups(produtos);
    if (particao) {
      pedidosResult.push({
        pedido_id: pedido.pedido_id,
        caixas: particao.groups.map((grupo, idx) => ({
          caixa_id: `Caixa ${particao.caixas[idx].id}`,
          produtos: grupo
            .sort((a, b) => a.index - b.index)
            .map((p) => p.produto_id),
        })),
      });
      continue;
    }

    const caixaUnica = pickSingleBoxForAll(produtos);
    if (caixaUnica) {
      pedidosResult.push({
        pedido_id: pedido.pedido_id,
        caixas: [
          {
            caixa_id: `Caixa ${caixaUnica.id}`,
            produtos: produtos
              .sort((a, b) => a.index - b.index)
              .map((p) => p.produto_id),
          },
        ],
      });
      continue;
    }

    const caixasAbertas: Caixa[] = [];
    for (const produto of produtos) {
      let colocado = false;
      for (const caixa of caixasAbertas) {
        if ('dim' in caixa === false) continue;
        const capacity =
          (caixa as any).dim.height *
          (caixa as any).dim.width *
          (caixa as any).dim.length;
        const ocupado = caixa.produtos.reduce((acc, pr) => acc + pr.volume, 0);
        const cabe = getRotations(produto).some(
          (r) =>
            r.h <= (caixa as any).dim.height &&
            r.w <= (caixa as any).dim.width &&
            r.l <= (caixa as any).dim.length,
        );
        if (ocupado + produto.volume <= capacity && cabe) {
          caixa.produtos.push(produto);
          colocado = true;
          break;
        }
      }
      if (!colocado) {
        const candidate = pickSmallestBoxForGroup([produto]);
        if (!candidate) {
          caixasAbertas.push({
            caixa_id: null,
            produtos: [produto],
            observacao: 'Produto não cabe em nenhuma caixa disponível.',
          });
        } else {
          caixasAbertas.push({
            caixa_id: `Caixa ${candidate.id}`,
            dim: candidate,
            produtos: [produto],
          } as any);
        }
      }
    }
    pedidosResult.push({
      pedido_id: pedido.pedido_id,
      caixas: caixasAbertas.map((c) => ({
        caixa_id: c.caixa_id,
        produtos: c.produtos
          .sort((a, b) => a.index - b.index)
          .map((p) => p.produto_id),
        ...((c as any).observacao ? { observacao: (c as any).observacao } : {}),
      })),
    });
  }

  return { pedidos: pedidosResult };
}
