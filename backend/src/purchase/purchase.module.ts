import { Module } from "@nestjs/common";
import { PurchaseController } from "./purchase.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PurchaseEntity } from "src/shared/entities/purchase.entity";
import { AssetModule } from "src/asset/asset.module";
import { PurchaseService } from "./purchase.service";
import { LicenseModule } from "src/license/license.module";

@Module({
    imports:[TypeOrmModule.forFeature([PurchaseEntity]) , AssetModule, LicenseModule],
    providers:[PurchaseService],
    controllers:[PurchaseController],
    exports:[PurchaseService],
})
export class PurchaseModule {}