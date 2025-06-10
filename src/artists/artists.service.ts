import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Artist } from './interfaces/artist.interface';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async getAllArtists(): Promise<Artist[]> {
    return this.prisma.artist.findMany();
  }

  async getArtistById(id: string): Promise<Artist> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return artist;
  }

  async createArtist(createArtistDto: CreateArtistDto): Promise<Artist> {
    const { name, grammy } = createArtistDto;
    
    return this.prisma.artist.create({
      data: {
        name,
        grammy,
      },
    });
  }

  async updateArtist(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    try {
      return await this.prisma.artist.update({
        where: { id },
        data: {
          name: updateArtistDto.name,
          grammy: updateArtistDto.grammy,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Artist not found');
      }
      throw error;
    }
  }

  async deleteArtist(id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    try {
      await this.prisma.artist.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Artist not found');
      }
      throw error;
    }
  }
} 
