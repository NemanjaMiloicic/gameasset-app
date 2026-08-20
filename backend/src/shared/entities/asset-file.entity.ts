import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AssetEntity } from "./asset.entity";

@Entity('asset_files')
export class AssetFilesEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fileUrl: string;

    @Column()
    fileName: string;

    @Column({nullable: true})
    fileSize: number;

    @ManyToOne(() => AssetEntity, (asset) => asset.files, {onDelete: 'CASCADE'})
    asset: AssetEntity;

    @CreateDateColumn()
    createdAt: Date;
}