import { Controller, Post, Get, UseGuards, Request, Body, Query, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { EmailDto } from "src/shared/dtos/email.dto";
import { TokenDto } from "./dtos/token.dto";
import { ResetPasswordDto } from "./dtos/resetPassword.dto";
import { ForgotPasswordDto } from "./dtos/forgotPassword.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req) {
        return this._authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@Request() req) {
        return req.user;
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: CreateUserDto) {
        return this._authService.register(body);
    }

    @Get('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Query() query: TokenDto) {
        return this._authService.verifyEmail(query);
    }

    @Post('forgotPassword')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() body: EmailDto) {
        return this._authService.forgotPassword(body);
    }

    @Get('validPasswordToken')
    @HttpCode(HttpStatus.OK)
    async validPasswordToken(@Query() query: ForgotPasswordDto) {
        return this._authService.validPasswordToken(query);
    }

    @Put('resetPassword')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this._authService.resetPassword(body);
    }
}