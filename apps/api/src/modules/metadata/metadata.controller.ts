import { Controller, Get, Param } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { Public } from '../../auth/jwt-auth.guard';

@Controller('metadata')
export class MetadataController {
    constructor(private metadataService: MetadataService) { }

    @Public()
    @Get('entities')
    findAll() {
        return this.metadataService.findAll();
    }

    @Public()
    @Get('entities/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.metadataService.findBySlug(slug);
    }
}
