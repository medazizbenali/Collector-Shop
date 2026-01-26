import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { KafkaService } from '../kafka/kafka.service';
import { Cart, CartItem } from './interfaces/cart.interface';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CartService {
  private readonly CART_TTL = 7 * 24 * 60 * 60; // 7 jours en secondes

  constructor(
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
  ) {}

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const key = this.getCartKey(userId);
    const cartData = await this.redisService.get(key);

    if (!cartData) {
      return {
        userId,
        items: [],
        totalPrice: 0,
        updatedAt: new Date(),
      };
    }

    return JSON.parse(cartData);
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    // Vérifier si l'article existe déjà dans le panier
    const existingItemIndex = cart.items.findIndex(
      (item) => item.articleId === addToCartDto.articleId,
    );

    if (existingItemIndex !== -1) {
      // Incrémenter la quantité si l'article existe déjà
      cart.items[existingItemIndex].quantity += addToCartDto.quantity;
    } else {
      // Ajouter un nouvel article
      const newItem: CartItem = {
        id: randomUUID(),
        articleId: addToCartDto.articleId,
        quantity: addToCartDto.quantity,
        price: addToCartDto.price,
        articleData: addToCartDto.articleData,
      };
      cart.items.push(newItem);
    }

    // Recalculer le prix total
    cart.totalPrice = this.calculateTotalPrice(cart.items);
    cart.updatedAt = new Date();

    // Sauvegarder dans Redis avec TTL
    await this.saveCart(userId, cart);

    // Publier l'événement Kafka
    await this.kafkaService.publishEvent('cart.events', {
      eventType: 'CART_ITEM_ADDED',
      userId,
      articleId: addToCartDto.articleId,
      quantity: addToCartDto.quantity,
      timestamp: new Date().toISOString(),
    });

    return cart;
  }

  async updateItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    cart.totalPrice = this.calculateTotalPrice(cart.items);
    cart.updatedAt = new Date();

    await this.saveCart(userId, cart);

    return cart;
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    }

    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);
    cart.totalPrice = this.calculateTotalPrice(cart.items);
    cart.updatedAt = new Date();

    await this.saveCart(userId, cart);

    // Publier l'événement Kafka
    await this.kafkaService.publishEvent('cart.events', {
      eventType: 'CART_ITEM_REMOVED',
      userId,
      articleId: removedItem.articleId,
      itemId,
      timestamp: new Date().toISOString(),
    });

    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await this.redisService.del(key);

    // Publier l'événement Kafka
    await this.kafkaService.publishEvent('cart.events', {
      eventType: 'CART_CLEARED',
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  private async saveCart(userId: string, cart: Cart): Promise<void> {
    const key = this.getCartKey(userId);
    const cartData = JSON.stringify(cart);
    await this.redisService.set(key, cartData, this.CART_TTL);
  }

  private calculateTotalPrice(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}
