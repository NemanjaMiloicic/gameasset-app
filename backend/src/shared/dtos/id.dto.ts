import { IsNotEmpty, IsUUID } from "class-validator";

export class IdDto {
    @IsUUID('4', {message: 'Not valid type of id'})
    @IsNotEmpty({message: 'Id is required'})
    public id: string;
}