import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { LoginDto } from "./dtos/login.dto";
import { UserEntity } from "src/shared/entities/user.entity";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { MailService } from "src/mail/mail.service";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import utils from "src/shared/utils/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmailDto } from "src/shared/dtos/email.dto";
import { TokenDto } from "./dtos/token.dto";
import { ResetPasswordDto } from "./dtos/resetPassword.dto";
import { ForgotPasswordDto } from "./dtos/forgotPassword.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _userRepo: Repository<UserEntity>,
        private readonly _userService: UserService,
        private readonly _jwtService: JwtService,
        private readonly _mailService: MailService
    ) {}

    async validateUser(dto : LoginDto) : Promise<UserEntity> {
        const user = await this._userService.findByEmail({email: dto.email})

        if(!user)
             throw new UnauthorizedException('Invalid credentials'); 

        const passwordMatches = await bcrypt.compare(dto.password, user.password);

        if(!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        return user;
    }
    async login(user: UserEntity): Promise<string> {
        const payload = {sub: user.id, email: user.email, role: user.userRole};
        return this._jwtService.sign(payload);
    }

    async register(dto: CreateUserDto): Promise<string> {
        const existingUser = await this._userService.findByEmail({ email: dto.email });

        if (existingUser)
            throw new ConflictException('Email already in use');

        const user = await this._userService.create(dto);

        const verificationToken = utils.generateToken();
        const tommorow = new Date()
        tommorow.setDate(tommorow.getDate() + 1)
        user.verificationToken = verificationToken;
        user.verificationExpires = tommorow;

        await this._userRepo.save(user);
        await this._mailService.sendVerificationEmail(user.email, verificationToken);
        return 'Registration successful, check your email to verify your account';
    }

    async verifyEmail(dto: TokenDto): Promise<string> {
        const user = await this._userRepo.findOne({ where: { verificationToken: dto.token } });

        if (!user)
            throw new BadRequestException('Invalid verification token');

        if (user.verificationExpires < new Date())
            throw new BadRequestException('Verification token expired');

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;

        await this._userRepo.save(user);

        return 'Email verified successfully';
    }

    async forgotPassword(dto: EmailDto): Promise<string> {
        const user = await this._userRepo.findOne({where: {email: dto.email}})

        if(!user)
            throw new NotFoundException('User with this email not found');
        user.forgotPasswordToken = utils.generateToken();
        const tommorow = new Date();
        tommorow.setDate(tommorow.getDate() + 1)
        user.forgotPasswordExpires = tommorow;
        await this._userRepo.save(user);
        await this._mailService.sendForgotPasswordMail(user.email, user.forgotPasswordToken);
        return 'Check your email to change your password'
    }

    async validPasswordToken(dto: ForgotPasswordDto) : Promise<boolean> {
        const user = await this._userRepo.findOne({where: {forgotPasswordToken: dto.token, email: dto.email}})
        if(!user)
            throw new BadRequestException('Invalid forgot password token');
        if (user.forgotPasswordExpires < new Date())
            throw new BadRequestException('Forgot password token expired');
        return true;
    }

    async resetPassword(dto: ResetPasswordDto): Promise<string> {
        const user= await this._userRepo.findOne({where: {forgotPasswordToken: dto.token, email: dto.email}});

        if(!user)
            throw new BadRequestException('Invalid forgot password token');
        if (user.forgotPasswordExpires < new Date())
            throw new BadRequestException('Forgot password token expired');
        user.forgotPasswordExpires = null;
        user.forgotPasswordToken = null;
        const hashedPassword = await bcrypt.hash(
            dto.password,
            await bcrypt.genSalt(10),
        )
        user.password = hashedPassword;
        await this._userRepo.save(user);
        return 'Password changed';

    }
}