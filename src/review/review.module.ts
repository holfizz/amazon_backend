import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewController } from './review.controller'
import { PrismaService } from '../prisma.service'
import { ProductService } from '../product/product.service'
import { ProductModule } from '../product/product.module'
import { PaginationModule } from '../pagination/pagination.module'
import { CategoryModule } from '../category/category.module'

@Module({
	controllers: [ReviewController],
	providers: [ReviewService, PrismaService, ProductService],
	imports: [ProductModule, PaginationModule, CategoryModule],
})
export class ReviewModule {}
