import { EnumOrderStatus } from '@prisma/client'
import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class OrderDto {
	@IsEnum(EnumOrderStatus)
	status: EnumOrderStatus

	@IsArray()
	@ValidateNested()
	@Type(() => OrderItemDto)
	items: OrderItemDto[]
}
export class OrderItemDto {
	@IsNumber()
	quantity: number

	@IsNumber()
	price: number

	@IsNumber()
	productId: number
}
