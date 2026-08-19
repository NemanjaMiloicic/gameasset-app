import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail({} , {message: 'Not a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    public email: string;

    @IsString({message: "Token must be string"})
    @IsNotEmpty({message: "Token is required"})
    public token: string
}