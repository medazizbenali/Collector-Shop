import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { FilterShopDto } from './dto/filter-shop.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private kafkaService: KafkaService,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createShopDto: CreateShopDto, ownerId: string): Promise<Shop> {
    // Utiliser le slug fourni ou le générer à partir du nom
    const baseSlug = createShopDto.slug || this.generateSlug(createShopDto.name);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (await this.shopRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Vérifier que l'utilisateur n'a pas déjà une boutique
    const existingShop = await this.shopRepository.findOne({ where: { ownerId } });
    if (existingShop) {
      throw new ConflictException('You already have a shop');
    }

    const shop = this.shopRepository.create({
      ...createShopDto,
      slug,
      ownerId,
      isActive: true,
      isVerified: false,
      totalSales: 0,
      totalRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
    });

    const savedShop = await this.shopRepository.save(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_CREATED',
      shopId: savedShop.id,
      ownerId: savedShop.ownerId,
      name: savedShop.name,
      slug: savedShop.slug,
      timestamp: new Date().toISOString(),
    });

    return savedShop;
  }

  async findAll(filterDto: FilterShopDto): Promise<{ shops: Shop[]; total: number }> {
    const {
      search,
      city,
      country,
      isActive,
      isVerified,
      ownerId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.shopRepository.createQueryBuilder('shop');

    if (search) {
      query.andWhere(
        '(shop.name LIKE :search OR shop.description LIKE :search OR shop.city LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (city) {
      query.andWhere('shop.city = :city', { city });
    }

    if (country) {
      query.andWhere('shop.country = :country', { country });
    }

    if (isActive !== undefined) {
      query.andWhere('shop.isActive = :isActive', { isActive });
    }

    if (isVerified !== undefined) {
      query.andWhere('shop.isVerified = :isVerified', { isVerified });
    }

    if (ownerId) {
      query.andWhere('shop.ownerId = :ownerId', { ownerId });
    }

    const total = await query.getCount();

    query.orderBy(`shop.${sortBy}`, sortOrder);
    query.skip((page - 1) * limit);
    query.take(limit);

    const shops = await query.getMany();

    return { shops, total };
  }

  async findOne(id: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id } });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    return shop;
  }

  async findBySlug(slug: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { slug } });

    if (!shop) {
      throw new NotFoundException(`Shop with slug ${slug} not found`);
    }

    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto, userId: string): Promise<Shop> {
    const shop = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own shop');
    }

    Object.assign(shop, updateShopDto);
    const updatedShop = await this.shopRepository.save(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_UPDATED',
      shopId: updatedShop.id,
      ownerId: updatedShop.ownerId,
      changes: updateShopDto,
      timestamp: new Date().toISOString(),
    });

    return updatedShop;
  }

  async remove(id: string, userId: string): Promise<void> {
    const shop = await this.findOne(id);

    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own shop');
    }

    await this.shopRepository.remove(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_DELETED',
      shopId: id,
      ownerId: shop.ownerId,
      timestamp: new Date().toISOString(),
    });
  }

  async verify(id: string): Promise<Shop> {
    const shop = await this.findOne(id);

    if (shop.isVerified) {
      throw new ConflictException('Shop is already verified');
    }

    shop.isVerified = true;
    const updatedShop = await this.shopRepository.save(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_VERIFIED',
      shopId: updatedShop.id,
      ownerId: updatedShop.ownerId,
      name: updatedShop.name,
      timestamp: new Date().toISOString(),
    });

    return updatedShop;
  }

  async deactivate(id: string, userId: string): Promise<Shop> {
    const shop = await this.findOne(id);

    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only deactivate your own shop');
    }

    if (!shop.isActive) {
      throw new ConflictException('Shop is already deactivated');
    }

    shop.isActive = false;
    const updatedShop = await this.shopRepository.save(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_DEACTIVATED',
      shopId: updatedShop.id,
      ownerId: updatedShop.ownerId,
      timestamp: new Date().toISOString(),
    });

    return updatedShop;
  }

  async activate(id: string, userId: string): Promise<Shop> {
    const shop = await this.findOne(id);

    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only activate your own shop');
    }

    if (shop.isActive) {
      throw new ConflictException('Shop is already active');
    }

    shop.isActive = true;
    const updatedShop = await this.shopRepository.save(shop);

    await this.kafkaService.publishEvent('shop.events', {
      eventType: 'SHOP_ACTIVATED',
      shopId: updatedShop.id,
      ownerId: updatedShop.ownerId,
      timestamp: new Date().toISOString(),
    });

    return updatedShop;
  }

  async updateStats(shopId: string, salesIncrement: number, revenueIncrement: number): Promise<Shop> {
    const shop = await this.findOne(shopId);

    shop.totalSales += salesIncrement;
    shop.totalRevenue = Number(shop.totalRevenue) + revenueIncrement;

    return await this.shopRepository.save(shop);
  }

  async updateRating(shopId: string, newRating: number): Promise<Shop> {
    const shop = await this.findOne(shopId);

    const totalRating = Number(shop.averageRating) * shop.reviewCount;
    shop.reviewCount += 1;
    shop.averageRating = (totalRating + newRating) / shop.reviewCount;

    return await this.shopRepository.save(shop);
  }

  async getStats(id: string): Promise<any> {
    const shop = await this.findOne(id);

    return {
      shopName: shop.name,
      totalArticles: 0,
      approvedArticles: 0,
      soldArticles: 0,
      totalRevenue: shop.totalRevenue,
      avgViews: 0,
      isVerified: shop.isVerified,
      averageRating: shop.averageRating,
      reviewCount: shop.reviewCount,
    };
  }

  async getShopArticles(id: string): Promise<{ articles: any[] }> {
    // Vérifier que la boutique existe
    await this.findOne(id);

    // Pour l'instant, retourner un tableau vide
    // Dans une vraie implémentation, on ferait un appel HTTP au service articles
    return { articles: [] };
  }
}
