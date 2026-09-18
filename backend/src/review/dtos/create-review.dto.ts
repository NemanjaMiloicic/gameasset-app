import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
    @IsUUID('4', { message: 'Not valid type of assetId' })
    assetId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string;
}