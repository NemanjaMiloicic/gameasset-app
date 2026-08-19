import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsString({message: "Token must be string"})
    @IsNotEmpty({message: "Token is required"})
    public token: string

    @IsString({message: "Password must be string"})
    @MinLength(6, {message: 'Password must be at least 6 characters'})
    @IsNotEmpty({message: "Password is required"})
    public password: string

    @IsEmail({} , {message: 'Not a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    public email: string;
}