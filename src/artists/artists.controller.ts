import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './interfaces/artist.interface';

@Controller('artist')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  async getAllArtists(): Promise<Artist[]> {
    return this.artistsService.getAllArtists();
  }

  @Get(':id')
  async getArtistById(@Param('id') id: string): Promise<Artist> {
    return this.artistsService.getArtistById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createArtist(
    @Body() createArtistDto: CreateArtistDto,
  ): Promise<Artist> {
    return this.artistsService.createArtist(createArtistDto);
  }

  @Put(':id')
  async updateArtist(
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
  ): Promise<Artist> {
    return this.artistsService.updateArtist(id, updateArtistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArtist(@Param('id') id: string): Promise<void> {
    await this.artistsService.deleteArtist(id);
  }
}
