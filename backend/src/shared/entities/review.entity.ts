import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { AssetEntity } from "./asset.entity";

@Entity('reviews')
@Unique(['author', 'asset'])
export class ReviewEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    author: UserEntity;

    @ManyToOne(() => AssetEntity, { onDelete: 'CASCADE' })
    asset: AssetEntity;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}