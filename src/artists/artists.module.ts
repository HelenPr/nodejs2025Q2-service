import { Module, forwardRef } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { FavoritesModule } from '../favorites/favorites.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [forwardRef(() => FavoritesModule)],
  controllers: [ArtistsController],
  providers: [ArtistsService, PrismaService],
  exports: [ArtistsService],
})
export class ArtistsModule {} 
