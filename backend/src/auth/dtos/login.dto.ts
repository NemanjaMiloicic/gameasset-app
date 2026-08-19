import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
    
    @IsEmail({} , {message: 'Not a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    public email: string;

    @IsString({message: 'Password must be string'})
    @MinLength(6, {message: 'Password must be at least 6 characters'})
    @IsNotEmpty({message: 'Password is required'})
    public password: string;
}