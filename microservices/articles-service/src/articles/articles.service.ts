import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private kafkaService: KafkaService,
  ) {}

  async create(createArticleDto: CreateArticleDto, sellerId: string): Promise<Article> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      sellerId,
      status: ArticleStatus.PENDING_APPROVAL,
    });

    const savedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_SUBMITTED_FOR_APPROVAL',
      articleId: savedArticle.id,
      sellerId: savedArticle.sellerId,
      categoryId: savedArticle.categoryId,
      title: savedArticle.title,
      price: savedArticle.price,
      timestamp: new Date().toISOString(),
    });

    return savedArticle;
  }

  async findAll(filterDto: FilterArticleDto): Promise<{ articles: Article[]; total: number }> {
    const {
      search,
      categoryId,
      sellerId,
      shopId,
      condition,
      status,
      minPrice,
      maxPrice,
      brand,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    console.log('\n🔎 [ArticlesService.findAll] Starting query with filters:', JSON.stringify(filterDto, null, 2));

    const query = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category');

    if (search) {
      query.andWhere(
        '(article.title LIKE :search OR article.description LIKE :search OR article.brand LIKE :search)',
        { search: `%${search}%` }
      );
      console.log('🔎 [ArticlesService.findAll] Applied search filter:', search);
    }

    if (categoryId) {
      query.andWhere('article.categoryId = :categoryId', { categoryId });
      console.log('🔎 [ArticlesService.findAll] Applied categoryId filter:', categoryId);
    }

    if (sellerId) {
      query.andWhere('article.sellerId = :sellerId', { sellerId });
      console.log('🔎 [ArticlesService.findAll] Applied sellerId filter:', sellerId);
    }

    if (shopId) {
      query.andWhere('article.shopId = :shopId', { shopId });
      console.log('🔎 [ArticlesService.findAll] Applied shopId filter:', shopId);
    }

    if (condition) {
      query.andWhere('article.condition = :condition', { condition });
      console.log('🔎 [ArticlesService.findAll] Applied condition filter:', condition);
    }

    if (status) {
      query.andWhere('article.status = :status', { status });
      console.log('🔎 [ArticlesService.findAll] Applied status filter:', status);
    } else if (!sellerId && !shopId) {
      // Par défaut, ne montrer que les articles approuvés SEULEMENT si on ne filtre pas par sellerId ou shopId
      // Si on filtre par sellerId (mes articles) ou shopId (articles de la boutique), on montre tous les statuts
      query.andWhere('article.status = :status', { status: ArticleStatus.APPROVED });
      console.log('🔎 [ArticlesService.findAll] Applied default APPROVED filter (no sellerId/shopId)');
    } else {
      console.log('🔎 [ArticlesService.findAll] No status filter (sellerId or shopId present, showing all statuses)');
    }

    if (minPrice !== undefined) {
      query.andWhere('article.price >= :minPrice', { minPrice });
      console.log('🔎 [ArticlesService.findAll] Applied minPrice filter:', minPrice);
    }

    if (maxPrice !== undefined) {
      query.andWhere('article.price <= :maxPrice', { maxPrice });
      console.log('🔎 [ArticlesService.findAll] Applied maxPrice filter:', maxPrice);
    }

    if (brand) {
      query.andWhere('article.brand = :brand', { brand });
      console.log('🔎 [ArticlesService.findAll] Applied brand filter:', brand);
    }

    // Log the generated SQL
    const sql = query.getSql();
    console.log('🔎 [ArticlesService.findAll] Generated SQL:', sql);
    console.log('🔎 [ArticlesService.findAll] Query parameters:', query.getParameters());

    const total = await query.getCount();
    console.log('🔎 [ArticlesService.findAll] Total count:', total);

    query.orderBy(`article.${sortBy}`, sortOrder);
    query.skip((page - 1) * limit);
    query.take(limit);

    const articles = await query.getMany();
    console.log('🔎 [ArticlesService.findAll] Articles retrieved:', articles.length);
    console.log('🔎 [ArticlesService.findAll] Articles data:', JSON.stringify(articles.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      sellerId: a.sellerId
    })), null, 2));

    return { articles, total };
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Increment view count
    await this.articleRepository.update(id, {
      viewCount: article.viewCount + 1,
    });

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string): Promise<Article> {
    const article = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (article.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    Object.assign(article, updateArticleDto);
    const updatedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_UPDATED',
      articleId: updatedArticle.id,
      sellerId: updatedArticle.sellerId,
      changes: updateArticleDto,
      timestamp: new Date().toISOString(),
    });

    return updatedArticle;
  }

  async remove(id: string, userId: string): Promise<void> {
    const article = await this.findOne(id);

    if (article.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articleRepository.remove(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_DELETED',
      articleId: id,
      sellerId: article.sellerId,
      timestamp: new Date().toISOString(),
    });
  }

  async submitForApproval(id: string, userId: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.sellerId !== userId) {
      throw new ForbiddenException('You can only submit your own articles');
    }

    if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.REJECTED) {
      throw new ForbiddenException('Only draft or rejected articles can be submitted for approval');
    }

    article.status = ArticleStatus.PENDING_APPROVAL;
    const updatedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_SUBMITTED_FOR_APPROVAL',
      articleId: updatedArticle.id,
      sellerId: updatedArticle.sellerId,
      timestamp: new Date().toISOString(),
    });

    return updatedArticle;
  }

  async approve(id: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.status !== ArticleStatus.PENDING_APPROVAL) {
      throw new ForbiddenException('Only pending articles can be approved');
    }

    article.status = ArticleStatus.APPROVED;
    const updatedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_APPROVED',
      articleId: updatedArticle.id,
      sellerId: updatedArticle.sellerId,
      timestamp: new Date().toISOString(),
    });

    return updatedArticle;
  }

  async reject(id: string, reason: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.status !== ArticleStatus.PENDING_APPROVAL) {
      throw new ForbiddenException('Only pending articles can be rejected');
    }

    article.status = ArticleStatus.REJECTED;
    article.rejectionReason = reason;
    const updatedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_REJECTED',
      articleId: updatedArticle.id,
      sellerId: updatedArticle.sellerId,
      reason,
      timestamp: new Date().toISOString(),
    });

    return updatedArticle;
  }

  async markAsSold(id: string, buyerId: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.status !== ArticleStatus.APPROVED) {
      throw new ForbiddenException('Only approved articles can be sold');
    }

    article.status = ArticleStatus.SOLD;
    article.buyerId = buyerId;
    const updatedArticle = await this.articleRepository.save(article);

    await this.kafkaService.publishEvent('article.events', {
      eventType: 'ARTICLE_SOLD',
      articleId: updatedArticle.id,
      sellerId: updatedArticle.sellerId,
      buyerId,
      price: updatedArticle.price,
      timestamp: new Date().toISOString(),
    });

    return updatedArticle;
  }

  async getStats(sellerId: string): Promise<{
    total: number;
    approved: number;
    pending: number;
    sold: number;
    totalRevenue: number;
  }> {
    const [total, approved, pending, sold] = await Promise.all([
      this.articleRepository.count({ where: { sellerId } }),
      this.articleRepository.count({ where: { sellerId, status: ArticleStatus.APPROVED } }),
      this.articleRepository.count({ where: { sellerId, status: ArticleStatus.PENDING_APPROVAL } }),
      this.articleRepository.count({ where: { sellerId, status: ArticleStatus.SOLD } }),
    ]);

    // Calculate total revenue from sold articles
    const soldArticles = await this.articleRepository.find({
      where: { sellerId, status: ArticleStatus.SOLD },
      select: ['price'],
    });

    const totalRevenue = soldArticles.reduce((sum, article) => sum + Number(article.price), 0);

    return {
      total,
      approved,
      pending,
      sold,
      totalRevenue,
    };
  }
}
