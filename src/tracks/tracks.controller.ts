import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track } from './interfaces/track.interface';

@Controller('track')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  async getAllTracks(): Promise<Track[]> {
    return this.tracksService.getAllTracks();
  }

  @Get(':id')
  async getTrackById(@Param('id') id: string): Promise<Track> {
    return this.tracksService.getTrackById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrack(@Body() createTrackDto: CreateTrackDto): Promise<Track> {
    return this.tracksService.createTrack(createTrackDto);
  }

  @Put(':id')
  async updateTrack(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto,
  ): Promise<Track> {
    return this.tracksService.updateTrack(id, updateTrackDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTrack(@Param('id') id: string): Promise<void> {
    await this.tracksService.deleteTrack(id);
  }
}
