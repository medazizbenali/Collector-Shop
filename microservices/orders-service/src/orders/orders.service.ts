import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private kafkaService: KafkaService,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<Order> {
    // Calculer le total
    const totalPrice = createOrderDto.items.reduce(
      (sum, item) => sum + (item.price * item.quantity + item.shippingCost),
      0,
    );

    const totalShippingCost = createOrderDto.items.reduce(
      (sum, item) => sum + item.shippingCost,
      0,
    );

    // Créer la commande
    const order = this.orderRepository.create({
      buyerId,
      paymentMethod: createOrderDto.paymentMethod,
      totalPrice,
      shippingCost: totalShippingCost,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Créer les items de commande
    const orderItems = createOrderDto.items.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        articleId: item.articleId,
        sellerId: item.sellerId,
        shopId: item.shopId,
        quantity: item.quantity,
        price: item.price,
        shippingCost: item.shippingCost,
        articleData: item.articleData,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    // Publier l'événement
    await this.kafkaService.publishEvent('order.events', {
      eventType: 'ORDER_CREATED',
      orderId: savedOrder.id,
      buyerId: savedOrder.buyerId,
      totalPrice: savedOrder.totalPrice,
      items: createOrderDto.items,
      timestamp: new Date().toISOString(),
    });

    // Retourner la commande avec les items
    return this.findOne(savedOrder.id);
  }

  async findAll(filterDto: FilterOrderDto, userId: string): Promise<{ orders: Order[]; total: number }> {
    const {
      buyerId,
      sellerId,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    // Filtrer par buyerId (pour les acheteurs)
    if (buyerId) {
      query.andWhere('order.buyerId = :buyerId', { buyerId });
    }

    // Filtrer par sellerId (pour les vendeurs)
    if (sellerId) {
      query.andWhere('items.sellerId = :sellerId', { sellerId });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(order.id LIKE :search OR order.notes LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();

    query.orderBy(`order.${sortBy}`, sortOrder);
    query.skip((page - 1) * limit);
    query.take(limit);

    const orders = await query.getMany();

    return { orders, total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Vérifier que l'utilisateur est autorisé (acheteur ou vendeur)
    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some((item) => item.sellerId === userId);

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You are not authorized to update this order');
    }

    const oldStatus = order.status;
    order.status = updateOrderStatusDto.status;

    // Mettre à jour les timestamps selon le statut
    if (updateOrderStatusDto.status === OrderStatus.PAID && !order.paidAt) {
      order.paidAt = new Date();
    } else if (updateOrderStatusDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (updateOrderStatusDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    if (updateOrderStatusDto.notes) {
      order.notes = updateOrderStatusDto.notes;
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Publier l'événement approprié
    let eventType = 'ORDER_STATUS_UPDATED';
    if (updateOrderStatusDto.status === OrderStatus.PAID) {
      eventType = 'ORDER_PAID';
    } else if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      eventType = 'ORDER_SHIPPED';
    } else if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      eventType = 'ORDER_DELIVERED';
    } else if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
      eventType = 'ORDER_CANCELLED';
    }

    await this.kafkaService.publishEvent('order.events', {
      eventType,
      orderId: updatedOrder.id,
      buyerId: updatedOrder.buyerId,
      oldStatus,
      newStatus: updatedOrder.status,
      timestamp: new Date().toISOString(),
    });

    return updatedOrder;
  }

  async checkout(id: string, userId: string): Promise<{ checkoutUrl: string }> {
    const order = await this.findOne(id);

    if (order.buyerId !== userId) {
      throw new ForbiddenException('You can only checkout your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be checked out');
    }

    // TODO: Intégrer avec Stripe
    // Pour l'instant, retourner une URL de placeholder
    const checkoutUrl = `http://localhost:3000/checkout/${order.id}`;

    return { checkoutUrl };
  }

  async markAsPaid(orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be marked as paid');
    }

    order.status = OrderStatus.PAID;
    order.paidAt = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    await this.kafkaService.publishEvent('order.events', {
      eventType: 'ORDER_PAID',
      orderId: updatedOrder.id,
      buyerId: updatedOrder.buyerId,
      totalPrice: updatedOrder.totalPrice,
      timestamp: new Date().toISOString(),
    });

    return updatedOrder;
  }
}
