import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { ProductService } from './product.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './dto/product.dto'

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@UsePipes(new ValidationPipe())
	@Get()
	async getAll(@Query() queryDto: GetAllProductDto) {
		return this.productService.getAll(queryDto)
	}

	@Get('similar/:id')
	async getSimilar(@Param('id') id: string) {
		return this.productService.getSimilar(+id)
	}

	@Get(':id')
	@Auth('admin')
	async getProduct(@Param('id') id: string) {
		return this.productService.byId(+id)
	}

	@Get('/by-slug/:slug')
	async getProductBySlug(@Param('slug') slug: string) {
		return this.productService.bySlug(slug)
	}

	@Get('/by-category/:categorySlug')
	async getProductByCategory(@Param('categorySlug') categorySlug: string) {
		return this.productService.byCategory(categorySlug)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth('admin')
	@Post()
	async createProduct() {
		return this.productService.create()
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth('admin')
	async updateProduct(@Param('id') id: string, @Body() dto: ProductDto) {
		return this.productService.update(+id, dto)
	}

	@Auth('admin')
	@HttpCode(200)
	@Delete(':id')
	async delete(@Param('id') id: string) {
		return this.productService.delete(+id)
	}
}
