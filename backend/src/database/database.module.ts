import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetFilesEntity } from "src/shared/entities/asset-file.entity";
import { AssetEntity } from "src/shared/entities/asset.entity";
import { UserEntity } from "src/shared/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config : ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST'),
                port: +config.get('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                entities: [UserEntity, AssetEntity, AssetFilesEntity],
                synchronize: true
            }),
        }),
    ],
})
export class DatabaseModule {}