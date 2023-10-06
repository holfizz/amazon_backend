import {PaginationDto} from "../../pagination/pagination.dto";
import {IsEnum, IsOptional, IsString} from "class-validator";

export enum EnumProductsSort {
  HIGH_PRICE = 'high_price',
  LOW_PRICE = 'low_price',
  NEWEST = 'newest',
  OLDEST = 'oldest'
}

export class GetAllProductDto extends PaginationDto {

  @IsOptional()
  @IsEnum(EnumProductsSort)
  sort?: EnumProductsSort

  @IsOptional()
  @IsString()
  searchTerm?: string
}
