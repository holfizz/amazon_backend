import { Prisma } from '@prisma/client'

export const returnProductObject: Prisma.CategorySelect = {
	id: true,
	name: true,
	slug: true,
}
