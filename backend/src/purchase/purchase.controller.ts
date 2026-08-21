import { Controller, Param, Post, UseGuards, Request, Get, Query, HttpCode, HttpStatus, Res, Req, Headers } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { IdDto } from "src/shared/dtos/id.dto";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import type { Response } from "express";
import { ZipArchive } from "archiver";
import axios from "axios";
import { LicenseType } from "src/shared/enums/license-type.enum";
import { LicenseDataDto } from "src/shared/dtos/license-data.dto";
import { LicenseService } from "src/license/license.service";
import type {RawBodyRequest}  from "@nestjs/common";
import { StripeService } from "src/stripe/stripe.service";
import { Stripe } from "node_modules/stripe/cjs/stripe.core";

@Controller('purchases')
export class PurchaseController {
    constructor(
        private readonly _purchaseService: PurchaseService,
        private readonly _licenseService: LicenseService,
        private readonly _stripeService: StripeService,
    ) {}

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
        const purchase = await this._purchaseService.getDownloadablePurchase(params, currentUser);
        const asset = purchase.asset;   

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

        if (asset.licenseType !== LicenseType.NOTHING) {
            const licenseData: LicenseDataDto = {
                assetTitle: asset.title,
                assetId: asset.id,
                authorUsername: asset.author.username,
                authorId: asset.author.id,
                purchasedAt: purchase.purchasedAt,
                licenseType: asset.licenseType,
            };
            const licenseBuffer = await this._licenseService.generateLicense(licenseData);
            archive.append(licenseBuffer, { name: `license_${licenseData.assetTitle}.pdf` });
        }

        await archive.finalize();
    }

    @Post('paid/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async initiatePaidPurchase(@Param() params: IdDto, @Request() req) {
        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        return this._purchaseService.initiatePaidPurchase(params, currentUser);
    }

    @Post('stripe/webhook')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        const event = this._stripeService.constructWebhookEvent(req.rawBody, signature);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this._purchaseService.completePaidPurchase(session);
        }

        return { received: true };
    }


}