import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AssetModule } from './asset/asset.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    DatabaseModule,
    UserModule,
    AuthModule,
    AssetModule,
    PurchaseModule,
    ReviewModule
  ],
})
export class AppModule {}
