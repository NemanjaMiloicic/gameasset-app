import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/user-role.enum";
import { Exclude } from "class-transformer";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    userRole: UserRole;

    @Column({nullable: true})
    avatarUrl?: string;

    @Column({type: 'text', nullable: true})
    bio?: string;

    @Column({default: false})
    isVerified: boolean;

    @Column({nullable: true})
    verificationToken?: string;

    @Column({type: 'timestamp', nullable: true})
    verificationExpires?: Date;

    @Column({nullable: true})
    forgotPasswordToken?: string;

    @Column({type: 'timestamp', nullable: true})
    forgotPasswordExpires?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}