import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { UserEntity } from "src/shared/entities/user.entity";
import { EmailDto } from "src/shared/dtos/email.dto";

@Controller('users')
export class UserController {
    constructor(
        private readonly _userService : UserService
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

}