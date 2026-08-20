import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, MaxLength, Min } from "class-validator";
import { AssetType } from "src/shared/enums/asset-type.enum";
import { LicenseType } from "src/shared/enums/license-type.enum";

export class CreateAssetDto {
    @IsString({message: 'Title must be string'})
    @MaxLength(25, {message: 'Title must be at most 25 characters'})
    @IsNotEmpty()
    public title: string;

    @IsString({message: 'Description must be string'})
    @MaxLength(350, {message: 'Description must be at most 350 characters'})
    @IsNotEmpty()
    public description: string;

    @IsEnum(AssetType, {message: 'Asset Type must be valid enum'})
    @IsNotEmpty({message: 'asset type must exist'})
    public assetType: AssetType;

    @Type(() => Number)
    @IsNumber()
    @Min(0, {message: 'Price must be atleast 0'})
    public price: number;

    @IsOptional()
    @IsEnum(LicenseType, {message: 'License Type must be valid enum'})
    public licenseType: LicenseType;

    @IsOptional()
    @IsArray({message: 'must be an array'})
    @IsString({each: true , message: 'Tags have to be string'})
    public tags: string[];

}