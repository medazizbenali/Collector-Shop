import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @Post('add')
  async addItem(@Req() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.id;
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Put('items/:itemId')
  async updateItem(
    @Req() req,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    return this.cartService.updateItem(userId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  async removeItem(@Req() req, @Param('itemId') itemId: string) {
    const userId = req.user.id;
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete('clear')
  async clearCart(@Req() req) {
    const userId = req.user.id;
    await this.cartService.clearCart(userId);
    return { message: 'Cart cleared successfully' };
  }
}
