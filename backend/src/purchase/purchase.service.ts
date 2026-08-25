import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Stripe } from "node_modules/stripe/cjs/stripe.core";
import { AssetService } from "src/asset/asset.service";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import { PurchaseEntity } from "src/shared/entities/purchase.entity";
import { UserEntity } from "src/shared/entities/user.entity";
import { StripeService } from "src/stripe/stripe.service";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseService {
    constructor(
        @InjectRepository(PurchaseEntity)
        private readonly _purchaseRepo: Repository<PurchaseEntity>,
        private readonly _assetService: AssetService,
        private readonly _stripeService: StripeService,
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

    async initiatePaidPurchase(idDto: IdDto, currentUser: CurrentUserDto): Promise<{ checkoutUrl: string }> {
        const asset = await this._assetService.findOne(idDto);

        if (asset.author.id === currentUser.id)
            throw new BadRequestException('You cannot purchase your own asset');

        if (Number(asset.price) === 0)
            throw new BadRequestException('This asset is free, use the free purchase flow');

        if (!asset.author.stripeOnboardingComplete || !asset.author.stripeAccountId)
            throw new BadRequestException('This author has not completed payment setup yet');

        const existingPurchase = await this._purchaseRepo.findOne({
            where: { buyer: { id: currentUser.id }, asset: { id: asset.id } },
        });

        if (existingPurchase)
            throw new ConflictException('You already own this asset');


        const session = await this._stripeService.createCheckoutSession(
            asset.title,
            Number(asset.price),
            asset.id,
            currentUser.id,
            asset.author.stripeAccountId,
        );

        return { checkoutUrl: session.url };
    }

    async completePaidPurchase(session: Stripe.Checkout.Session): Promise<void> {
        const assetId = session.metadata.assetId;
        const buyerId = session.metadata.buyerId;

        const existing = await this._purchaseRepo.findOne({
            where: { buyer: { id: buyerId }, asset: { id: assetId } },
        });

        if (existing) return;

        const asset = await this._assetService.findOne({ id: assetId });

        const purchase = this._purchaseRepo.create({
            buyer: { id: buyerId } as Partial<UserEntity>,
            asset: asset,
            pricePaid: Number(asset.price),
            stripePaymentId: session.payment_intent as string,
        });

        await this._purchaseRepo.save(purchase);
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



    async getDownloadablePurchase(idDto: IdDto, currentUser: CurrentUserDto): Promise<PurchaseEntity> {

        const purchase = await this._purchaseRepo.findOne({
            where: { id: idDto.id, buyer: { id: currentUser.id } },
            relations: { asset: { files: true, author: true } },
        });

        if (!purchase) 
            throw new NotFoundException('Purchase not found');

        return purchase;
    }

    async checkOwnership(assetId: string, currentUser: CurrentUserDto): Promise<{ owned: boolean; purchaseId: string | null }> {
        const purchase = await this._purchaseRepo.findOne({
            where: { asset: { id: assetId }, buyer: { id: currentUser.id } },
        });

        return {
            owned: !!purchase,
            purchaseId: purchase?.id ?? null,
        };
    }


}