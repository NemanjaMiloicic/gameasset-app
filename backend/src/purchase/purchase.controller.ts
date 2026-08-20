import { Controller, Param, Post, UseGuards, Request, Get, Query, HttpCode, HttpStatus, Res } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { IdDto } from "src/shared/dtos/id.dto";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import type { Response } from "express";
import { ZipArchive } from "archiver";
import axios from "axios";

@Controller('purchases')
export class PurchaseController {
    constructor(private readonly _purchaseService: PurchaseService) {}

    @Post('free/:id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async createFreePurchase(@Param() params: IdDto, @Request() req) {

        const currentUser: CurrentUserDto = {id: req.user.id, userRole:req.user.userRole};
        return this._purchaseService.createFreePurchase(params, currentUser);
    }

    @Get('my')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findMyPurchases(@Query() query: PaginationDto, @Request() req) {
        const currentUserDto: CurrentUserDto = {id: req.user.id, userRole: req.user.userRole};
        return this._purchaseService.findMyPurchases(currentUserDto, query);
    }

    @Get(':id/download')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async downloadPurchase(
        @Param() params: IdDto,
        @Request() req,
        @Res() res: Response
    ) {

        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        const asset = await this._purchaseService.getDownloadableAsset(params, currentUser);
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${asset.title}.zip"`,
        });

        const archive = new ZipArchive({zlib: {level: 9}});
        archive.pipe(res);
        for (const file of asset.files) {
            
            const response = await axios.get(file.fileUrl, {
                responseType: 'stream',
            });

            archive.append(response.data, {
                name: file.fileName,
            });
        }

        await archive.finalize();
    }

}