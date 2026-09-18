import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReviewEntity } from "src/shared/entities/review.entity";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { PurchaseService } from "src/purchase/purchase.service";
import { AssetService } from "src/asset/asset.service";
import { UserRole } from "src/shared/enums/user-role.enum";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(ReviewEntity)
        private readonly _reviewRepo: Repository<ReviewEntity>,
        private readonly _purchaseService: PurchaseService,
        private readonly _assetService: AssetService,
    ) {}

    async create(dto: CreateReviewDto, currentUser: CurrentUserDto): Promise<ReviewEntity> {
        const { owned } = await this._purchaseService.checkOwnership(dto.assetId, currentUser);

        if (!owned)
            throw new ForbiddenException('You can only review assets you have purchased');

        const existing = await this._reviewRepo.findOne({
            where: { author: { id: currentUser.id }, asset: { id: dto.assetId } },
        });

        if (existing)
            throw new ConflictException('You already reviewed this asset');

        const asset = await this._assetService.findOne({ id: dto.assetId });

        const review = this._reviewRepo.create({
            author: { id: currentUser.id } as any,
            asset,
            rating: dto.rating,
            comment: dto.comment,
        });

        return this._reviewRepo.save(review);
    }

    async findByAsset(idDto: IdDto): Promise<ReviewEntity[]> {
        return this._reviewRepo.find({
            where: { asset: { id: idDto.id } },
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findMyReview(assetId: string, currentUser: CurrentUserDto): Promise<ReviewEntity | null> {
        return this._reviewRepo.findOne({
            where: { author: { id: currentUser.id }, asset: { id: assetId } },
        });
    }

    async remove(idDto: IdDto, currentUser: CurrentUserDto): Promise<void> {
        const review = await this._reviewRepo.findOne({
            where: { id: idDto.id },
            relations: { author: true },
        });

        if (!review)
            throw new NotFoundException('Review not found');

        if (review.author.id !== currentUser.id && currentUser.userRole !== UserRole.ADMIN)
            throw new ForbiddenException('You can only delete your own review');

        await this._reviewRepo.remove(review);
    }

    async getAverageRating(assetId: string): Promise<{ average: number; count: number }> {
        const reviews = await this._reviewRepo.find({ where: { asset: { id: assetId } } });

        if (reviews.length === 0)
            return { average: 0, count: 0 };

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return { average: total / reviews.length, count: reviews.length };
    }
}