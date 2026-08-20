import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssetType } from "../enums/asset-type.enum";
import { LicenseType } from "../enums/license-type.enum";
import { UserEntity } from "./user.entity";
import { AssetFilesEntity } from "./asset-file.entity";

@Entity('assets')
export class AssetEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({type: 'text'})
    description: string;

    @Column({type: 'enum', enum: AssetType})
    assetType: AssetType;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 0})
    price: number;

    @Column({type: 'enum', enum: LicenseType})
    licenseType: LicenseType;

    @Column({nullable: true})
    previewImageUrl: string;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
    author: UserEntity;

    @OneToMany(() => AssetFilesEntity, (file) => file.asset, {cascade: true})
    files: AssetFilesEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}