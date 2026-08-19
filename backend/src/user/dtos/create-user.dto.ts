import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, {message: 'Not a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    public email: string;

    @IsString({message: 'Username must be string'})
    @Length(3, 20, {message: 'Username length must be at least 3 and at most 20 characters'})
    @IsNotEmpty({message: 'Username is required'})
    public username: string;

    @IsString({message: 'Password must be string'})
    @MinLength(6, {message: 'Password must be at least 6 characters'})
    @IsNotEmpty({message: 'Password is required'})
    public password: string;

}