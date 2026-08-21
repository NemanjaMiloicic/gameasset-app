import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards, Request, BadRequestException } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { UserEntity } from "src/shared/entities/user.entity";
import { EmailDto } from "src/shared/dtos/email.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/shared/guards/roles.guard";
import { UserRole } from "src/shared/enums/user-role.enum";
import { Roles } from "src/shared/decorators/roles.decorator";
import { StripeService } from "src/stripe/stripe.service";

@Controller('users')
export class UserController {
    constructor(
        private readonly _userService : UserService,
        private readonly _stripeService: StripeService,
    ) {}

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    public async createUser(@Body() body: CreateUserDto): Promise<string> {
        await this._userService.create(body);
        return `User:${body.username} added sucessfully`;
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    public async findById(@Param() param: IdDto): Promise<UserEntity> {
        return await this._userService.findById(param);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    public async findByEmail(@Query() query: EmailDto): Promise<UserEntity> {
        return await this._userService.findByEmail(query);
    }

    @Post('stripe/connect')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async connectStripe(@Request() req) {
        const user = await this._userService.findById({ id: req.user.id });

        let stripeAccountId = user.stripeAccountId;

        if (!stripeAccountId) { 
            stripeAccountId = await this._stripeService.createConnectedAccount(user.id, user.email);
            await this._userService.setStripeAccountId(user.id, stripeAccountId);
        }

        const onboardingUrl = await this._stripeService.createOnboardingLink(stripeAccountId);
        return { onboardingUrl };
    }

    @Get('stripe/onboarding-complete')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async stripeOnboardingComplete(@Request() req) {

        const user = await this._userService.findById({
            id: req.user.id,
        });

        if (!user.stripeAccountId)
            throw new BadRequestException('Stripe account not found');

        const account = await this._stripeService.retrieveAccount(
            user.stripeAccountId,
        );

        if (
            account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled
        ) {
            await this._userService.markOnboardingComplete(user.id);
        }

        return {
            onboardingComplete:
                account.details_submitted &&
                account.charges_enabled &&
                account.payouts_enabled,
        };
}



}