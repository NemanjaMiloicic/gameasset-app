import { UserRole } from "src/shared/enums/user-role.enum";

export class CurrentUserDto {
    public id: string;
    public userRole: UserRole;
}