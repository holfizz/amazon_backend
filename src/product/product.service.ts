import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {productReturnObjectFullest, returnProductObject} from "../product/return-product.object";
import {EnumProductsSort, GetAllProductDto} from "./dto/get-all.product.dto";
import {PaginationService} from "../pagination/pagination.service";
import {Prisma} from "@prisma/client";
import {ProductDto} from "./dto/product.dto";
import {generateSlug} from "../../utils/generate-utils";
import {CategoryService} from "../category/category.service";

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService,
              private paginationService: PaginationService,
              private categoryService: CategoryService) {
  }

  async getAll(dto: GetAllProductDto = {}) {
    const {sort, searchTerm} = dto

    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = []

    if (sort === EnumProductsSort.LOW_PRICE) {
      prismaSort.push({price: 'asc'})
    } else if (sort === EnumProductsSort.HIGH_PRICE) {
      prismaSort.push({price: 'desc'})
    } else if (sort === EnumProductsSort.OLDEST) {
      prismaSort.push({createdAt: 'asc'})
    } else {
      prismaSort.push({createdAt: 'desc'})
    }
    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm ? {
      OR: [
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive"
            }
          },
        },
        {
          name: {
            contains: searchTerm,
            mode: "insensitive"
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive"
          }
        }
      ]
    } : {}
    const {perPage, skip} = this.paginationService.getPagination(dto)
    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage
    })
    return {
      products, lenght: await this.prisma.product.count({
        where: prismaSearchTermFilter
      })
    }
  }


  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id
      },
      select: productReturnObjectFullest
    })

    if (!product) throw new NotFoundException('Product not found!')
    return product
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findMany({
      where: {
        slug
      },
      select: productReturnObjectFullest
    })

    if (!product) throw new NotFoundException('Product not found!')
    return product
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug
        }
      },
      select: productReturnObjectFullest
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
          name: currentProduct.category.name
        },
        NOT: {
          id: currentProduct.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: returnProductObject
    })

    return products
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        description: '',
        name: '',
        price: 0,
        slug: ''
      }
    })

    return product.id
  }

  async update(id: number, dto: ProductDto) {
    const {description, images, price, name, categoryId} = dto

    await this.categoryService.byId(categoryId)

    return this.prisma.product.update({
      where: {
        id
      },
      data: {
        description,
        images,
        price,
        name,
        slug: generateSlug(name),
        category: {
          connect: {
            id: categoryId
          }
        }
      }
    })
  }

  async delete(id: number) {
    return this.prisma.product.delete({where: {id}})
  }
}
