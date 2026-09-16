import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';

export class SearchAssetsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => (value === '' || value === null ? undefined : value))
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
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    isFree?: boolean;

    @IsOptional()
    @IsString()
    tags?: string;
}