import { Module, forwardRef } from '@nestjs/common';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { FavoritesModule } from '../favorites/favorites.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [forwardRef(() => FavoritesModule)],
  controllers: [AlbumsController],
  providers: [AlbumsService, PrismaService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
