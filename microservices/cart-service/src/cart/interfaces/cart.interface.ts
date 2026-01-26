export interface CartItem {
  id: string;
  articleId: string;
  quantity: number;
  price: number;
  articleData: {
    title: string;
    image: string;
    sellerId: string;
  };
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  updatedAt: Date;
}
