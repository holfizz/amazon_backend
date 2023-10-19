import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { OrderDto } from './order.dto'
import { returnProductObject } from '../product/return-product.object'
import * as YooKassa from 'yookassa'
import * as process from 'process'

const yooKassa = new YooKassa({
	shopId: process.env['SHOP_ID'],
	secretKey: process.env['PAYMENT_TOKEN'],
})

@Injectable()
export class OrderService {
	constructor(private prisma: PrismaService) {}

	async getAll() {
		return this.prisma.order.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				items: {
					include: {
						product: {
							select: returnProductObject,
						},
					},
				},
			},
		})
	}
	async getByUserId(userId: number) {
		return this.prisma.order.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				items: {
					include: {
						product: {
							select: returnProductObject,
						},
					},
				},
			},
		})
	}
	async placeOrder(dto: OrderDto, userId: number) {
		const order = await this.prisma.order.create({
			data: {
				status: dto.status,
				items: {
					create: dto.items,
				},
				user: {
					connect: {
						id: userId,
					},
				},
			},
		})
		return order
	}
}
