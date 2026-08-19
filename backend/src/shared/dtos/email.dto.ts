import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
    @IsEmail({}, {message: 'Not a valid email address'})
    @IsNotEmpty({message: 'Email is required'})
    public email: string;
}