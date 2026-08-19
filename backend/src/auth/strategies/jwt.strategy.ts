import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { JwtPayload } from "../interfaces/JwtPayload";
import { UserEntity } from "src/shared/entities/user.entity";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly _configService: ConfigService,
        private readonly _userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: _configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<UserEntity> {
        const user = await this._userService.findById({ id: payload.sub });

        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        return user;
    }
}
