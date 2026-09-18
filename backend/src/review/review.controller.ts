import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { IdDto } from "src/shared/dtos/id.dto";
import { CurrentUserDto } from "src/shared/dtos/current-user.dto";

@Controller()
export class ReviewController {
    constructor(private readonly _reviewService: ReviewService) {}

    @Post('reviews')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: CreateReviewDto, @Request() req) {
        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        return this._reviewService.create(body, currentUser);
    }

    @Get('assets/:id/reviews')
    @HttpCode(HttpStatus.OK)
    async findByAsset(@Param() params: IdDto) {
        return this._reviewService.findByAsset(params);
    }

    @Get('assets/:id/reviews/rating')
    @HttpCode(HttpStatus.OK)
    async getAverageRating(@Param() params: IdDto) {
        return this._reviewService.getAverageRating(params.id);
    }

    @Get('reviews/mine/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async findMyReview(@Param() params: IdDto, @Request() req) {
        const review = await this._reviewService.findMyReview(params.id, {
            id: req.user.id,
            userRole: req.user.userRole,
        });
        return review ?? null;
    }

    @Delete('reviews/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Param() params: IdDto, @Request() req) {
        const currentUser: CurrentUserDto = { id: req.user.id, userRole: req.user.userRole };
        await this._reviewService.remove(params, currentUser);
    }
}