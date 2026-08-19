import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/shared/entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import * as bcrypt from 'bcrypt';
import { IdDto } from "src/shared/dtos/id.dto";
import { EmailDto } from "src/shared/dtos/email.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _userRepository: Repository<UserEntity>,
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

    async findById(dto: IdDto): Promise<UserEntity> {
        const user = await this._userRepository.findOne({where: {id : dto.id}})
        if(!user)
            throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(dto: EmailDto): Promise<UserEntity> {
        const user = await this._userRepository.findOne({where: {email: dto.email}})
        if(!user)
            throw new NotFoundException('User not found');
        return user;
    }
}