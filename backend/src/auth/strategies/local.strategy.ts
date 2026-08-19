import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginDto } from "../dtos/login.dto";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly _authService : AuthService) {
        super({usernameField: 'email'});
    }

    async validate(email: string, password: string) {
        const dto: LoginDto = {email, password};
        return this._authService.validateUser(dto);
    }
        
}