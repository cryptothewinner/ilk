import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { EntityDefinitionDto } from '@sepenatural/shared';

@Injectable()
export class MetadataService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<EntityDefinitionDto[]> {
        const entities = await this.prisma.entityDefinition.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });

        return entities.map(entity => this.mapToDto(entity));
    }

    async findBySlug(slug: string): Promise<EntityDefinitionDto> {
        const entity = await this.prisma.entityDefinition.findUnique({
            where: { slug },
        });

        if (!entity) {
            throw new NotFoundException(`Entity definition '${slug}' not found`);
        }

        return this.mapToDto(entity);
    }

    private mapToDto(entity: any): EntityDefinitionDto {
        return {
            id: entity.id,
            slug: entity.slug,
            name: entity.name,
            displayName: entity.name,
            description: entity.description,
            icon: entity.icon,
            fields: entity.fields as any[],
            fieldGroups: (entity.fieldGroups as any[]) ?? [],
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
        };
    }
}
