import { Controller, Post, Get, UseGuards, Request, Body, Query, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { EmailDto } from "src/shared/dtos/email.dto";
import { TokenDto } from "./dtos/token.dto";
import { ResetPasswordDto } from "./dtos/resetPassword.dto";
import { ForgotPasswordDto } from "./dtos/forgotPassword.dto";
import { LoginResponse } from "src/shared/interfaces/login-response.interface";

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req): Promise<LoginResponse> {
          const accessToken = await this._authService.login(req.user);
          return {
            accessToken,
            user: {
                id: req.user.id,
                email: req.user.email,
                username: req.user.username,
                userRole: req.user.userRole,
                stripeOnboardingComplete: req.user.stripeOnboardingComplete,
            },
        }; 
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@Request() req) {
        return req.user;
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: CreateUserDto): Promise<{message: string}> {
        const message = await this._authService.register(body);
        return {message};
    }

    @Get('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Query() query: TokenDto): Promise<{message: string}> {
        const message = await this._authService.verifyEmail(query);
        return {message};
    }

    @Post('forgotPassword')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() body: EmailDto): Promise<{message: string}> {
        const message = await this._authService.forgotPassword(body);
        return {message};
    }

    @Get('validPasswordToken')
    @HttpCode(HttpStatus.OK)
    async validPasswordToken(@Query() query: ForgotPasswordDto): Promise<boolean> {
        return await this._authService.validPasswordToken(query);
    }

    @Put('resetPassword')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() body: ResetPasswordDto): Promise<{message: string}> {
        const message = await this._authService.resetPassword(body);
        return {message};
    }
}