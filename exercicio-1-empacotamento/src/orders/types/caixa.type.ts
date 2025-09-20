import { BoxDim } from '../../common/types/box-dim.type';

export interface CaixaComDim {
  caixa_id: string;
  dim: BoxDim;
  produtos: import('./produto.type').Produto[];
}

export interface CaixaSemDim {
  caixa_id: null;
  produtos: import('./produto.type').Produto[];
  observacao: string;
}

export type Caixa = CaixaComDim | CaixaSemDim;
