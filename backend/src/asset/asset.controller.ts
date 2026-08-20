import { Body, Controller, Get, Param, Post, Put, Request, UseGuards, UploadedFiles, UseInterceptors, HttpCode, HttpStatus, UploadedFile, Delete } from "@nestjs/common";
import { AssetService } from "./asset.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/shared/guards/roles.guard";
import { Roles } from "src/shared/decorators/roles.decorator";
import { UserRole } from "src/shared/enums/user-role.enum";
import { CreateAssetDto } from "./dtos/create-asset.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { UpdateAssetDto } from "./dtos/update-asset.dto";
import { CurrentUserDto } from "../shared/current-user.dto";

@Controller('assets')
export class AssetController {
    constructor(private readonly _assetService: AssetService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async create(@Body() dto: CreateAssetDto, @Request() req) {
        return await this._assetService.create(dto, {id: req.user.id})
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this._assetService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param() params: IdDto) {
        return this._assetService.findOne(params);
    }

    @Post(':id/files')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('files'))
    async addFiles(
        @Param() params: IdDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        return this._assetService.addFiles(params, files);
    }

    @Put(':id/preview')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('preview'))
    async addPreviewImage(
        @Param() params: IdDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this._assetService.updatePreviewImage(params, file);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async update(
        @Param() params: IdDto,
        @Body() dto: UpdateAssetDto, 
        @Request() req
    ) {
        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        return this._assetService.update(params, dto, currentUser);

    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async remove(
        @Param() params: IdDto,
        @Request() req
    ) {

        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        return this._assetService.remove(params, currentUser);

    }
}