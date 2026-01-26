import { shopsClient } from '@/lib/api';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopDto {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
}

export interface UpdateShopDto {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  isActive?: boolean;
}

export interface ShopStats {
  shopName: string;
  totalArticles: number;
  approvedArticles: number;
  soldArticles: number;
  totalRevenue: number;
  avgViews: number;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
}

class ShopsApi {
  // Seller endpoints
  async createShop(data: CreateShopDto): Promise<Shop> {
    const response = await shopsClient.post('/shops', data);
    return response.data;
  }

  async getMyShops(): Promise<Shop[]> {
    const response = await shopsClient.get('/shops/my/shops');
    return response.data.data || [];
  }

  async updateShop(id: string, data: UpdateShopDto): Promise<Shop> {
    const response = await shopsClient.patch(`/shops/${id}`, data);
    return response.data;
  }

  async deleteShop(id: string): Promise<void> {
    await shopsClient.delete(`/shops/${id}`);
  }

  // Public endpoints
  async getShopById(id: string): Promise<Shop> {
    const response = await shopsClient.get(`/shops/${id}`);
    return response.data.data;
  }

  async getShopStats(id: string): Promise<ShopStats> {
    const response = await shopsClient.get(`/shops/${id}/stats`);
    return response.data.data;
  }

  async getShopArticles(id: string): Promise<{ articles: any[] }> {
    const response = await shopsClient.get(`/shops/${id}/articles`);
    return response.data.data;
  }
}

export const shopsApi = new ShopsApi();
