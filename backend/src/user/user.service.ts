import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/shared/entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import * as bcrypt from 'bcrypt';
import { IdDto } from "src/shared/dtos/id.dto";
import { EmailDto } from "src/shared/dtos/email.dto";
import { UserRole } from "src/shared/enums/user-role.enum";
import { UpdateProfileDto } from "./dtos/update-author.dto";
import { SupabaseService } from "src/supabase/supabase.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _userRepository: Repository<UserEntity>,
        private readonly _supabaseService: SupabaseService,
    ) {}

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const userExists = await this._userRepository.findOne({
            where: [{email: dto.email} , {username: dto.username}]
        })

        if(userExists)
            throw new ConflictException('Email or username already in use');

        const hashedPassword = await bcrypt.hash(
            dto.password,
            await bcrypt.genSalt(10),
        )

        const userEntity = this._userRepository.create({
            email: dto.email,
            username: dto.username,
            password: hashedPassword,
        });

        return this._userRepository.save(userEntity);
    }

    async findById(dto: IdDto): Promise<UserEntity | null> {
        return await this._userRepository.findOne({where: {id : dto.id}})   
    }

    async findByEmail(dto: EmailDto): Promise<UserEntity | null> {
        return await this._userRepository.findOne({where: {email: dto.email}})
    }

    async setStripeAccountId(userId: string, stripeAccountId: string): Promise<void> {
        await this._userRepository.update(userId, { stripeAccountId });
    }

    async markOnboardingComplete(userId: string): Promise<void> {
        await this._userRepository.update(userId, { stripeOnboardingComplete: true });
    }

    async promoteToAuthor(userId: string): Promise<void> {
        await this._userRepository.update(userId, { userRole: UserRole.AUTHOR });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<void> {
        await this._userRepository.update(userId, dto);
    }

    async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
        const user = await this.findById({ id: userId });

        if (!user)
            throw new NotFoundException('User not found');

        if (user.avatarUrl)
            await this._supabaseService.deleteFileByUrl(user.avatarUrl);

        const path = `avatars/${userId}/${Date.now()}-${file.originalname}`;
        const avatarUrl = await this._supabaseService.uploadFile(
            path,
            file.buffer,
            file.mimetype,
        );

        await this._userRepository.update(userId, { avatarUrl });
        return avatarUrl;
    }

    
}