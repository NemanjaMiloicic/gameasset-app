import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetService } from "src/asset/asset.service";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import { AssetEntity } from "src/shared/entities/asset.entity";
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

        if (asset.author.id === currentUserDto.id) 
            throw new BadRequestException('You cannot purchase your own asset');

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

    async findMyPurchases(currentUserDto: CurrentUserDto, paginationDto: PaginationDto): Promise<{ data: PurchaseEntity[]; total: number }> {
        const [data, total] = await this._purchaseRepo.findAndCount({
            where: { buyer: { id: currentUserDto.id } },
            relations: { asset: { author: true, files: true } },
            order: { purchasedAt: 'DESC' },
            skip: paginationDto.skip,
            take: paginationDto.limit,
        });

        return { data, total };
    }

    // async getDownloadableAsset(idDto: IdDto, currentUser: CurrentUserDto): Promise<AssetEntity> {
    //     const purchase = await this._purchaseRepo.findOne({
    //         where: { id: idDto.id, buyer: { id: currentUser.id } },
    //         relations: { asset: { files: true } },
    //     });

    //     if (!purchase) 
    //         throw new NotFoundException('Purchase not found');

    //     return purchase.asset;
    // }

    async getDownloadablePurchase(idDto: IdDto, currentUser: CurrentUserDto): Promise<PurchaseEntity> {

        const purchase = await this._purchaseRepo.findOne({
            where: { id: idDto.id, buyer: { id: currentUser.id } },
            relations: { asset: { files: true, author: true } },
        });

        if (!purchase) 
            throw new NotFoundException('Purchase not found');

        return purchase;
    }
}