import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetService } from "src/asset/asset.service";
import { CurrentUserDto } from "src/shared/current-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { PurchaseEntity } from "src/shared/entities/purchase.entity";
import { UserEntity } from "src/shared/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseService {
    constructor(
        @InjectRepository(PurchaseEntity)
        private readonly _purchaseRepo: Repository<PurchaseEntity>,
        private readonly _assetService: AssetService,
    ) {}

    async createFreePurchase(idDto: IdDto, currentUserDto: CurrentUserDto): Promise<PurchaseEntity> {
        const asset = await this._assetService.findOne(idDto);

        if(Number(asset.price) !== 0)
            throw new BadRequestException('This asset is not free, use the paid purchase flow');

        const existingPurchase = await this._purchaseRepo.findOne({
            where: {buyer: {id: currentUserDto.id}, asset: {id: asset.id}},
        });

        if(existingPurchase)
            throw new ConflictException('You already own this asset');

        const purchaseEntity = this._purchaseRepo.create({
            buyer: {id: currentUserDto.id} as Partial<UserEntity>,
            asset: asset,
            pricePaid: 0,
        });

        return await this._purchaseRepo.save(purchaseEntity);
    }
}