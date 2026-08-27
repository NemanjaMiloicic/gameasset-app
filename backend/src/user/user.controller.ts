import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards, Request, BadRequestException, NotFoundException, Put, UseInterceptors, UploadedFile } from "@nestjs/common";
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
import { PublicAuthorProfile } from "src/shared/interfaces/public-author-profile.interface";
import { UpdateProfileDto } from "./dtos/update-author.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('users')
export class UserController {
    constructor(
        private readonly _userService : UserService,
        private readonly _stripeService: StripeService,
    ) {}

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    public async createUser(@Body() body: CreateUserDto): Promise<{message: string}> {
        await this._userService.create(body);
        return {message: `User:${body.username} added sucessfully`};
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    public async findById(@Param() param: IdDto): Promise<PublicAuthorProfile> {
         const user = await this._userService.findById(param);

        if (!user)
            throw new NotFoundException('User not found');

        return {
            id: user.id,
            username: user.username,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    public async findByEmail(@Query() query: EmailDto): Promise<UserEntity> {
        return await this._userService.findByEmail(query);
    }

    @Post('stripe/connect')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
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
    async stripeOnboardingComplete(@Request() req) {
        
        const user = await this._userService.findById({ id: req.user.id });

        if (!user.stripeAccountId)
            throw new BadRequestException('Stripe account not found');

        const account = await this._stripeService.retrieveAccount(user.stripeAccountId);
        const isComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;

        if (isComplete) {
            await this._userService.markOnboardingComplete(user.id);

            if (user.userRole === UserRole.USER) {
                await this._userService.promoteToAuthor(user.id);
            }
        }

        return { onboardingComplete: isComplete };
    }

    @Put('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() body: UpdateProfileDto): Promise<PublicAuthorProfile> {
        
        await this._userService.updateProfile(req.user.id, body);
        const user = await this._userService.findById({ id: req.user.id });

        return {
            id: user.id,
            username: user.username,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
        };
    }

    @Put('me/avatar')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ avatarUrl: string }> {

        const avatarUrl = await this._userService.updateAvatar(req.user.id, file);
        return { avatarUrl };
        
    }



}