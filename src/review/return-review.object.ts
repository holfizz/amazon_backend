import { Prisma } from '@prisma/client'

export const returnReviewObject: Prisma.CategorySelect = {
	id: true,
	name: true,
	slug: true,
}
