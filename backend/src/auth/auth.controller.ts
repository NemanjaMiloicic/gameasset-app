import { Controller, Post, Get, UseGuards, Request, Body, Query } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dtos/create-user.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this._authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return req.user;
    }

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return this._authService.register(dto);
    }

    @Get('verify')
    async verify(@Query('token') token: string) {
        return this._authService.verifyEmail(token);
    }
}