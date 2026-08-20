import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Skip must be an integer'})
    @Min(0, {message: 'Skip must be at least 0'})
    public skip: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Skip must be an integer'})
    @Min(1, {message: 'Skip must be at least 1'})
    public limit: number = 10;
    
    
}