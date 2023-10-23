import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
	productReturnObjectFullest,
	returnProductObject,
} from '../product/return-product.object'
import { EnumProductsSort, GetAllProductDto } from './dto/get-all.product.dto'
import { PaginationService } from '../pagination/pagination.service'
import { Prisma } from '@prisma/client'
import { ProductDto } from './dto/product.dto'
import { generateSlug } from '../../utils/generate-utils'
import { CategoryService } from '../category/category.service'
import { ConvertToNumber } from '../../utils/convert-to-number'

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService,
		private categoryService: CategoryService,
	) {}

	async getAll(dto: GetAllProductDto = {}) {
		const { perPage, skip } = this.paginationService.getPagination(dto)

		const filters = this.createFilter(dto)

		const products = await this.prisma.product.findMany({
			where: filters,
			orderBy: this.getSortOption(dto.sort),
			skip,
			take: perPage,
			select: returnProductObject,
		})

		return {
			products,
			length: await this.prisma.product.count({
				where: filters,
			}),
		}
	}

	private getCategoryFilter(categoryId: number): Prisma.ProductWhereInput {
		return {
			categoryId,
		}
	}
	private createFilter(dto: GetAllProductDto): Prisma.ProductWhereInput {
		const filters: Prisma.ProductWhereInput[] = []
		if (dto.searchTerm) filters.push(this.getSearchTermFilter(dto.searchTerm))

		if (dto.ratings)
			filters.push(
				this.getRatingFilter(dto.ratings.split('|').map(rating => +rating)),
			)
		if (dto.minPrice || dto.maxPrice)
			filters.push(
				this.getPriceFilter(
					ConvertToNumber(dto.minPrice),
					ConvertToNumber(dto.maxPrice),
				),
			)
		if (dto.categoryId) filters.push(this.getCategoryFilter(+dto.categoryId))
		return filters.length ? { AND: filters } : {}
	}
	private getSortOption(
		sort: EnumProductsSort,
	): Prisma.ProductOrderByWithRelationInput[] {
		switch (sort) {
			case EnumProductsSort.LOW_PRICE:
				return [{ price: 'asc' }]
			case EnumProductsSort.HIGH_PRICE:
				return [{ price: 'desc' }]
			case EnumProductsSort.OLDEST:
				return [{ createdAt: 'asc' }]
			default:
				return [{ createdAt: 'desc' }]
		}
	}
	private getSearchTermFilter(searchTerm: string): Prisma.ProductWhereInput {
		return
		{
			OR: [
				{
					category: {
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				},
				{
					name: {
						contains: searchTerm,
						mode: 'insensitive',
					},
				},
				{
					description: {
						contains: searchTerm,
						mode: 'insensitive',
					},
				},
			]
		}
	}
	private getRatingFilter(ratings: number[]): Prisma.ProductWhereInput {
		return {
			reviews: {
				some: {
					rating: {
						in: ratings,
					},
				},
			},
		}
	}

	private getPriceFilter(
		minPrice?: number,
		maxPrice?: number,
	): Prisma.ProductWhereInput {
		let priceFilter: Prisma.IntFilter | undefined = undefined

		if (minPrice) {
			priceFilter = {
				...priceFilter,
				gte: minPrice,
			}
		}
		if (maxPrice) {
			priceFilter = {
				...priceFilter,
				lte: maxPrice,
			}
		}
		return { price: priceFilter }
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: {
				id,
			},
			select: productReturnObjectFullest,
		})

		if (!product) throw new NotFoundException('Product not found!')
		return product
	}

	async bySlug(slug: string) {
		const product = await this.prisma.product.findMany({
			where: {
				slug,
			},
			select: productReturnObjectFullest,
		})

		if (!product) throw new NotFoundException('Product not found!')
		return product
	}

	async byCategory(categorySlug: string) {
		const products = await this.prisma.product.findMany({
			where: {
				category: {
					slug: categorySlug,
				},
			},
			select: productReturnObjectFullest,
		})

		if (!products) throw new NotFoundException('Products not found!')
		return products
	}

	async getSimilar(id: number) {
		const currentProduct = await this.byId(id)

		if (!currentProduct)
			throw new NotFoundException('Current product not found!')

		const products = await this.prisma.product.findMany({
			where: {
				category: {
					name: currentProduct.category.name,
				},
				NOT: {
					id: currentProduct.id,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: returnProductObject,
		})

		return products
	}

	async create() {
		const product = await this.prisma.product.create({
			data: {
				description: '',
				name: '',
				price: 0,
				slug: '',
			},
		})

		return product.id
	}

	async update(id: number, dto: ProductDto) {
		const { description, images, price, name, categoryId } = dto

		await this.categoryService.byId(categoryId)

		return this.prisma.product.update({
			where: {
				id,
			},
			data: {
				description,
				images,
				price,
				name,
				slug: generateSlug(name),
				category: {
					connect: {
						id: categoryId,
					},
				},
			},
		})
	}

	async delete(id: number) {
		return this.prisma.product.delete({ where: { id } })
	}
}
