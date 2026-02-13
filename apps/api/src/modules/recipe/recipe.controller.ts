import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { CreateRecipeItemDto } from './dto/create-recipe-item.dto';
import { UpdateRecipeItemDto } from './dto/update-recipe-item.dto';

@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(100), ParseIntPipe) pageSize: number,
        @Query('sortField') sortField?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query('search') search?: string,
        @Query('filters') filters?: string,
    ) {
        return this.recipeService.findAll({
            page, pageSize: Math.min(pageSize, 500), sortField, sortOrder, search,
            filters: filters ? JSON.parse(filters) : undefined,
        });
    }

    @Get('summary')
    async getSummary() {
        return this.recipeService.getSummary();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.recipeService.findOne(id);
    }

    @Get(':id/cost')
    async recalculateCost(@Param('id') id: string) {
        const recipe = await this.recipeService.recalculateCost(id);
        return { success: true, data: recipe };
    }

    @Post()
    async create(@Body() dto: CreateRecipeDto) {
        const recipe = await this.recipeService.create(dto);
        return { success: true, data: recipe };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
        const recipe = await this.recipeService.update(id, dto);
        return { success: true, data: recipe };
    }

    @Post(':id/items')
    async addItem(@Param('id') recipeId: string, @Body() dto: CreateRecipeItemDto) {
        const item = await this.recipeService.addItem(recipeId, dto);
        return { success: true, data: item };
    }

    @Patch(':recipeId/items/:itemId')
    async updateItem(
        @Param('recipeId') recipeId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateRecipeItemDto,
    ) {
        const item = await this.recipeService.updateItem(recipeId, itemId, dto);
        return { success: true, data: item };
    }

    @Delete(':recipeId/items/:itemId')
    async removeItem(@Param('recipeId') recipeId: string, @Param('itemId') itemId: string) {
        return this.recipeService.removeItem(recipeId, itemId);
    }
}
