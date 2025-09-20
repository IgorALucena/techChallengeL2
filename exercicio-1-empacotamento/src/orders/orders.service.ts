import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { packOrders } from './packing/packing.engine';

@Injectable()
export class OrdersService {
  create(createOrderDto: CreateOrderDto) {
    return packOrders(createOrderDto);
  }
}
