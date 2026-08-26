import { UserRole } from "../enums/user-role.enum";

export interface AuthUserResponse {
    id: string;
    email: string;
    username: string;
    userRole: UserRole;
    stripeOnboardingComplete: boolean;
}