import {Prisma} from '@prisma/client'
import {returnCategoryObject} from "../category/return-category.object";
import {returnReviewObject} from "../review/return-review.object";

export const returnProductObject: Prisma.ProductSelect = {
  images: true,
  description: true,
  id: true,
  name: true,
  price: true,
  createdAt: true,
  slug: true,
  category: {select: returnCategoryObject},
  reviews: {
    select: returnReviewObject,
    orderBy: {
      createdAt: 'desc'
    }
  }
}
export const productReturnObjectFullest: Prisma.ProductSelect = {
  ...returnProductObject,
 
}

