import { Controller, Param, Post, UseGuards, Request } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { IdDto } from "src/shared/dtos/id.dto";
import { CurrentUserDto } from "src/shared/current-user.dto";

@Controller('purchases')
export class PurchaseController {
    constructor(private readonly _purchaseService: PurchaseService) {}

    @Post('free/:id')
    @UseGuards(JwtAuthGuard)
    async createFreePurchase(@Param() params: IdDto, @Request() req) {

        const currentUser: CurrentUserDto = {id: req.user.id, userRole:req.user.userRole};
        return this._purchaseService.createFreePurchase(params, currentUser);
    }
}