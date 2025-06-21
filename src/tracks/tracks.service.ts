import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { FavoritesService } from '../favorites/favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TracksService {
  constructor(
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
    private readonly prisma: PrismaService,
  ) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async getAllTracks(): Promise<Track[]> {
    const tracks = await this.prisma.track.findMany();
    return tracks.map(
      (track): Track => ({
        id: track.id,
        name: track.name,
        artistId: track.artistId,
        albumId: track.albumId,
        duration: track.duration,
      }),
    );
  }

  async getTrackById(id: string): Promise<Track> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return {
      id: track.id,
      name: track.name,
      artistId: track.artistId,
      albumId: track.albumId,
      duration: track.duration,
    };
  }

  async createTrack(createTrackDto: CreateTrackDto): Promise<Track> {
    const { name, artistId, albumId, duration } = createTrackDto;

    const track = await this.prisma.track.create({
      data: {
        name,
        duration,
        artistId,
        albumId,
      },
    });

    return {
      id: track.id,
      name: track.name,
      artistId: track.artistId,
      albumId: track.albumId,
      duration: track.duration,
    };
  }

  async updateTrack(
    id: string,
    updateTrackDto: UpdateTrackDto,
  ): Promise<Track> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    try {
      const track = await this.prisma.track.update({
        where: { id },
        data: {
          name: updateTrackDto.name,
          duration: updateTrackDto.duration,
          artistId: updateTrackDto.artistId,
          albumId: updateTrackDto.albumId,
        },
      });

      return {
        id: track.id,
        name: track.name,
        artistId: track.artistId,
        albumId: track.albumId,
        duration: track.duration,
      };
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Track not found');
      }
      throw error;
    }
  }

  async deleteTrack(id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    try {
      await this.prisma.track.delete({
        where: { id },
      });
      await this.favoritesService.handleTrackDeletion(id);
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Track not found');
      }
      throw error;
    }
  }

  async handleArtistDeletion(artistId: string): Promise<void> {
    await this.prisma.track.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }

  async handleAlbumDeletion(albumId: string): Promise<void> {
    await this.prisma.track.updateMany({
      where: { albumId },
      data: { albumId: null },
    });
  }
}
