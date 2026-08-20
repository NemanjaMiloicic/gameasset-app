import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetEntity } from "src/shared/entities/asset.entity";
import { UserModule } from "src/user/user.module";
import { AssetService } from "./asset.service";
import { AssetController } from "./asset.controller";
import { SupabaseModule } from "src/supabase/supabase.module";
import { AssetFilesEntity } from "src/shared/entities/asset-file.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AssetEntity, AssetFilesEntity]), UserModule, SupabaseModule],
    providers: [AssetService],
    controllers: [AssetController],
    exports: [AssetService],
})
export class AssetModule {}