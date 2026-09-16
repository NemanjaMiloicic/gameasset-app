import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssetEntity } from "src/shared/entities/asset.entity";
import { Repository } from "typeorm";
import { CreateAssetDto } from "./dtos/create-asset.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { UserService } from "src/user/user.service";
import { SupabaseService } from "src/supabase/supabase.service";
import 'multer';
import { AssetFilesEntity } from "src/shared/entities/asset-file.entity";
import { UpdateAssetDto } from "./dtos/update-asset.dto";
import { CurrentUserDto } from "../shared/dtos/current-user.dto";
import { UserRole } from "src/shared/enums/user-role.enum";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import { SearchAssetsDto } from "./dtos/search-assets.dto";

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

   async findAll(dto: SearchAssetsDto): Promise<{ data: AssetEntity[]; total: number }> {
        const query = this._assetRepo.createQueryBuilder('asset')
            .leftJoinAndSelect('asset.author', 'author')
            .leftJoinAndSelect('asset.files', 'files')
            .orderBy('asset.createdAt', 'DESC');

        if (dto.search) {
            query.andWhere('asset.title ILIKE :search', { search: `%${dto.search}%` });
        }

        if (dto.assetType) {
            query.andWhere('asset.assetType = :assetType', { assetType: dto.assetType });
        }

        if (dto.isFree === true) {
            query.andWhere('asset.price = 0');
        } else {
            if (dto.minPrice !== undefined) {
                query.andWhere('asset.price >= :minPrice', { minPrice: dto.minPrice });
            }
            if (dto.maxPrice !== undefined) {
                query.andWhere('asset.price <= :maxPrice', { maxPrice: dto.maxPrice });
            }
        }

        if (dto.tags) {
            const tagList = dto.tags.split(',').map((t) => t.trim()).filter((t) => t);

            if (tagList.length > 0) {
                const tagConditions = tagList
                    .map((_, index) => `asset.tags ILIKE :tag${index}`)
                    .join(' OR ');

                const tagParams = tagList.reduce((acc, tag, index) => {
                    acc[`tag${index}`] = `%${tag}%`;
                    return acc;
                }, {} as Record<string, string>);

                query.andWhere(`(${tagConditions})`, tagParams);
            }
        }

        query.skip(dto.skip).take(dto.limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
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

        if(asset.previewImageUrl)
            await this._supabaseService.deleteFileByUrl(asset.previewImageUrl);

        const path = `previews/${asset.id}/${Date.now()}-${file.originalname}`;
        const previewUrl = await this._supabaseService.uploadFile(
            path,
            file.buffer,
            file.mimetype,
        );

        asset.previewImageUrl = previewUrl;
        return this._assetRepo.save(asset);

    }

    async update(idDto: IdDto, assetDto: UpdateAssetDto, currentUserDto: CurrentUserDto): Promise<AssetEntity> {
        const asset = await this.findOne(idDto);

        if(asset.author.id !== currentUserDto.id && currentUserDto.userRole!== UserRole.ADMIN)
            throw new ForbiddenException('You can only edit your own assets');

        Object.assign(asset, assetDto);
        return await this._assetRepo.save(asset);
    }

    async remove(idDto: IdDto, currentUserDto: CurrentUserDto) : Promise<void> {
        const asset = await this.findOne(idDto);

        if(asset.author.id !== currentUserDto.id && currentUserDto.userRole !== UserRole.ADMIN)
            throw new ForbiddenException('You can only delete your own assets');

        const urlsToDelete: string[] = [];

        if(asset.previewImageUrl) {
           urlsToDelete.push(asset.previewImageUrl)
        }

        for(const file of asset.files) {
            urlsToDelete.push(file.fileUrl)
        }

        
        await this._supabaseService.deleteFilesByUrls(urlsToDelete);
        await this._assetRepo.remove(asset);
    }

    async findMyAssets(currentUserDto: CurrentUserDto, paginationDto: PaginationDto) : Promise<{data: AssetEntity[]; total: number}>  {
        const [data, total] = await this._assetRepo.findAndCount({
            where: {author: {id: currentUserDto.id}},
            relations: {files: true},
            order: {createdAt: 'DESC'},
            skip: paginationDto.skip,
            take: paginationDto.limit,
        });

        return {data, total};
    }



}

