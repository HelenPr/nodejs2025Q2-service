import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class AlbumsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async getAllAlbums(): Promise<Album[]> {
    return this.prisma.album.findMany({
      include: {
        artist: true,
      },
    });
  }

  async getAlbumById(id: string): Promise<Album> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid album ID format');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
      },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  async createAlbum(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { name, year, artistId } = createAlbumDto;

    return this.prisma.album.create({
      data: {
        name,
        year,
        artistId,
      },
      include: {
        artist: true,
      },
    });
  }

  async updateAlbum(
    id: string,
    updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid album ID format');
    }

    try {
      return await this.prisma.album.update({
        where: { id },
        data: {
          name: updateAlbumDto.name,
          year: updateAlbumDto.year,
          artistId: updateAlbumDto.artistId,
        },
        include: {
          artist: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Album not found');
      }
      throw error;
    }
  }

  async deleteAlbum(id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid album ID format');
    }

    try {
      await this.prisma.album.delete({
        where: { id },
      });
      await this.favoritesService.handleAlbumDeletion(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Album not found');
      }
      throw error;
    }
  }

  async handleArtistDeletion(artistId: string): Promise<void> {
    await this.prisma.album.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }
}
