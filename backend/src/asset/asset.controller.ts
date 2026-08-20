import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AssetService } from "./asset.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/shared/guards/roles.guard";
import { Roles } from "src/shared/decorators/roles.decorator";
import { UserRole } from "src/shared/enums/user-role.enum";
import { CreateAssetDto } from "./dtos/create-asset.dto";

@Controller('assets')
export class AssetController {
    constructor(private readonly _assetService: AssetService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    async create(@Body() dto: CreateAssetDto, @Request() req) {
        return await this._assetService.create(dto, {id: req.user.id})
    }
}