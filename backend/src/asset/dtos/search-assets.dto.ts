import { IsOptional, IsString, IsNumber, IsBooleanString, Min } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "src/shared/dtos/pagination.dto";

export class SearchAssetsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    assetType?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsBooleanString()
    isFree?: string;

    @IsOptional()
    @IsString()
    tags?: string;
}