import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewEntity } from "src/shared/entities/review.entity";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";
import { PurchaseModule } from "src/purchase/purchase.module";
import { AssetModule } from "src/asset/asset.module";

@Module({
    imports: [TypeOrmModule.forFeature([ReviewEntity]), PurchaseModule, AssetModule],
    controllers: [ReviewController],
    providers: [ReviewService],
    exports: [ReviewService],
})
export class ReviewModule {}