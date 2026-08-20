import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetEntity } from "src/shared/entities/asset.entity";
import { Repository } from "typeorm";
import { CreateAssetDto } from "./dtos/create-asset.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(AssetEntity)
        private readonly _assetRepo: Repository<AssetEntity>,
        private readonly _userService: UserService,
    ) {}

    async create(assetDto: CreateAssetDto, idDto: IdDto): Promise<AssetEntity> {
        const user = await this._userService.findById(idDto);

        if(!user)
            throw new NotFoundException('User not found');

        const assetEntity = this._assetRepo.create({
            title: assetDto.title,
            description: assetDto.description,
            assetType: assetDto.assetType,
            price: assetDto.price,
            licenseType: assetDto.licenseType,
            tags: assetDto.tags,
            author: user,
        })
        return await this._assetRepo.save(assetEntity);
        
    }
}