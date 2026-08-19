import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { MailModule } from "src/mail/mail.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/shared/entities/user.entity";

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config : ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: {expiresIn: config.get('JWT_EXPIRES')},
            }),
        }),
        MailModule,
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}