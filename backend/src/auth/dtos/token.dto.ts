import { IsNotEmpty, IsString } from "class-validator";

export class TokenDto {
    @IsString({message: "Token must be string"})
    @IsNotEmpty({message: "Token is required"})
    public token: string
}