import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetEntity } from "src/shared/entities/asset.entity";
import { Repository } from "typeorm";
import { CreateAssetDto } from "./dtos/create-asset.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { UserService } from "src/user/user.service";
import { SupabaseService } from "src/supabase/supabase.service";
import 'multer';
import { AssetFilesEntity } from "src/shared/entities/asset-file.entity";

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(AssetEntity)
        private readonly _assetRepo: Repository<AssetEntity>,
        @InjectRepository(AssetFilesEntity)
        private readonly _assetFileRepo: Repository<AssetFilesEntity>,
        private readonly _userService: UserService,
        private readonly _supabaseService : SupabaseService,
    ) {}

    async create(assetDto: CreateAssetDto, idDto: IdDto): Promise<AssetEntity> {
        const user = await this._userService.findById(idDto);

        if(!user)
            throw new NotFoundException('User not found');

        const assetEntity = this._assetRepo.create({
            title: assetDto.title,
            description: assetDto.description,
            assetType: assetDto.assetType,
            price: assetDto.price,
            licenseType: assetDto.licenseType,
            tags: assetDto.tags,
            author: user,
        })
        return await this._assetRepo.save(assetEntity);
    }

    async findAll(): Promise<AssetEntity[]> {
        return this._assetRepo.find({
            relations: { author: true },
            order: {createdAt: 'DESC'}
        });
    }

    async findOne(idDto: IdDto): Promise<AssetEntity> {
        const asset = await this._assetRepo.findOne({
            where: { id: idDto.id },
            relations: { author: true, files: true },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found');
        }

        return asset;
    }
    async addFiles(idDto: IdDto, files: Array<Express.Multer.File>): Promise<AssetEntity> {
        const asset = await this.findOne(idDto);
        
        for(const file of files) {
            const path = `assets/${asset.id}/${Date.now()}-${file.originalname}`;
            const fileUrl = await this._supabaseService.uploadFile(
                path,
                file.buffer,
                file.mimetype
            );

            const assetFile = this._assetFileRepo.create({
                fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                asset
            });

            await this._assetFileRepo.save(assetFile);
        }

        return this.findOne(idDto);
    }

    async updatePreviewImage(idDto: IdDto, file: Express.Multer.File): Promise<AssetEntity> {
    const asset = await this.findOne(idDto);

    const path = `previews/${asset.id}/${Date.now()}-${file.originalname}`;
    const previewUrl = await this._supabaseService.uploadFile(
        path,
        file.buffer,
        file.mimetype,
    );

    asset.previewImageUrl = previewUrl;
    return this._assetRepo.save(asset);
}

}