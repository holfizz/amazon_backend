import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UserService } from '../user/user.service'

@Injectable()
export class StatisticsService {
	constructor(
		private prisma: PrismaService,
		private userService: UserService,
	) {}

	async getMain() {
		const ordersCount = await this.prisma.order.count()
		const reviewsCount = await this.prisma.review.count()
		const usersCount = await this.prisma.user.count()
		return [
			{
				name: 'Orders',
				value: ordersCount,
			},
			{
				name: 'Reviews',
				value: reviewsCount,
			},
			{
				name: 'Users',
				value: usersCount,
			},
			{
				name: 'Total amount',
				value: 1000,
			},
		]
	}
}
