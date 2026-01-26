import { cartClient } from '@/lib/api';
import { Article } from './articlesApi';

export interface CartItem {
  id: string;
  article: Article;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartDto {
  articleId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

class CartApiService {
  async getCart(): Promise<Cart> {
    const response = await cartClient.get('/cart');
    return response.data;
  }

  async addToCart(data: AddToCartDto): Promise<Cart> {
    const response = await cartClient.post('/cart/add', data);
    return response.data;
  }

  async updateCartItem(itemId: string, data: UpdateCartItemDto): Promise<Cart> {
    const response = await cartClient.put(`/cart/items/${itemId}`, data);
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await cartClient.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<Cart> {
    const response = await cartClient.delete('/cart/clear');
    return response.data;
  }
}

export const cartApi = new CartApiService();
