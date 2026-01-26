import { articlesClient } from '@/lib/api';

export interface Article {
  id: string;
  title: string;
  description: string;
  price: number;
  shippingCost: number;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sold' | 'archived';
  images: string[];
  tags: string[];
  brand?: string;
  year?: number;
  quantity: number;
  viewCount: number;
  favoriteCount: number;
  categoryId: string;
  sellerId: string;
  buyerId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateArticleDto {
  title: string;
  description: string;
  price: number;
  shippingCost: number;
  condition: string;
  categoryId: string;
  shopId?: string;
  brand?: string;
  year?: number;
  quantity?: number;
  tags?: string[];
  images?: string[];
}

export interface FilterParams {
  search?: string;
  categoryId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  shopId?: string;
  sortBy?: 'createdAt' | 'price' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

class ArticlesApi {
  // Public - Liste des articles
  async getArticles(params: FilterParams = {}): Promise<ArticlesResponse> {
    const response = await articlesClient.get('/articles', { params });
    const { data, meta } = response.data;
    return {
      articles: data || [],
      total: meta?.total || 0,
      page: meta?.page || 1,
      limit: meta?.limit || 20,
      totalPages: meta?.total && meta?.limit ? Math.ceil(meta.total / meta.limit) : 1,
    };
  }

  // Public - Détail d'un article
  async getArticle(id: string, incrementView = false): Promise<Article> {
    const response = await articlesClient.get(`/articles/${id}`, {
      params: { incrementView },
    });
    return response.data.data;
  }

  // Public - Articles similaires
  async getSimilarArticles(id: string, limit = 5): Promise<Article[]> {
    const response = await articlesClient.get(`/articles/${id}/similar`, {
      params: { limit },
    });
    return response.data.data;
  }

  // Public - Liste des catégories
  async getCategories(): Promise<Category[]> {
    const response = await articlesClient.get('/categories');
    return response.data.data;
  }

  // Auth required - Créer un article
  async createArticle(data: CreateArticleDto): Promise<Article> {
    const response = await articlesClient.post('/articles', data);
    return response.data.data;
  }

  // Auth required - Modifier un article
  async updateArticle(id: string, data: Partial<CreateArticleDto>): Promise<Article> {
    const response = await articlesClient.patch(`/articles/${id}`, data);
    return response.data.data;
  }

  // Auth required - Supprimer un article
  async deleteArticle(id: string): Promise<void> {
    await articlesClient.delete(`/articles/${id}`);
  }

  // Auth required - Mes articles
  async getMyArticles(params: FilterParams = {}): Promise<ArticlesResponse> {
    console.log('🌐 [articlesApi] Calling /articles/my-articles with params:', params);
    console.log('🌐 [articlesApi] Base URL:', articlesClient.defaults.baseURL);

    // Add timestamp to prevent caching
    const paramsWithTimestamp = { ...params, _t: Date.now() };

    const response = await articlesClient.get('/articles/my-articles', {
      params: paramsWithTimestamp,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('🌐 [articlesApi] Response status:', response.status);
    console.log('🌐 [articlesApi] Response headers:', response.headers);
    console.log('🌐 [articlesApi] Response data:', response.data);
    console.log('🌐 [articlesApi] Full response:', JSON.stringify(response.data, null, 2));

    const { data, meta } = response.data;
    return {
      articles: data || [],
      total: meta?.total || 0,
      page: meta?.page || 1,
      limit: meta?.limit || 20,
      totalPages: meta?.total && meta?.limit ? Math.ceil(meta.total / meta.limit) : 1,
    };
  }

  // Auth required - Statistiques
  async getStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    sold: number;
    totalRevenue: number;
  }> {
    const response = await articlesClient.get('/articles/stats');
    return response.data.data;
  }

  // Admin - Approuver
  async approveArticle(id: string): Promise<Article> {
    const response = await articlesClient.post(`/articles/${id}/approve`, {});
    return response.data.data;
  }

  // Admin - Rejeter
  async rejectArticle(id: string, reason: string): Promise<Article> {
    const response = await articlesClient.post(`/articles/${id}/reject`, { reason });
    return response.data.data;
  }
}

export const articlesApi = new ArticlesApi();
