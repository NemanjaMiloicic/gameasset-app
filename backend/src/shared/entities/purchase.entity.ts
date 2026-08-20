import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./user.entity";
import { AssetEntity } from "./asset.entity";

@Entity('purchases')
@Unique(['buyer', 'asset'])
export class PurchaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity)
    buyer: UserEntity

    @ManyToOne(() => AssetEntity)
    asset: AssetEntity

    @Column({ type: 'decimal', precision: 10, scale: 2})
    pricePaid: number;

    @Column({ nullable: true})
    stripePaymentId: string;

    @Column({ nullable: true})
    licenseUrl: string;

    @CreateDateColumn()
    purchasedAt: Date;
}