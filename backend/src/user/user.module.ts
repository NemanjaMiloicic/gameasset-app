import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/shared/entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { StripeModule } from "src/stripe/stripe.module";
import { SupabaseModule } from "src/supabase/supabase.module";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), StripeModule, SupabaseModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}