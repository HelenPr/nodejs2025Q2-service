import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  private tracks: Track[] = [];

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  getAllTracks(): Track[] {
    return this.tracks;
  }

  getTrackById(id: string): Track {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    const track = this.tracks.find(track => track.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  createTrack(createTrackDto: CreateTrackDto): Track {
    const { name, artistId, albumId, duration } = createTrackDto;
    
    const newTrack: Track = {
      id: randomUUID(),
      name,
      artistId,
      albumId,
      duration,
    };

    this.tracks.push(newTrack);
    return newTrack;
  }

  updateTrack(id: string, updateTrackDto: UpdateTrackDto): Track {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    const trackIndex = this.tracks.findIndex(track => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }

    const updatedTrack = {
      ...this.tracks[trackIndex],
      ...updateTrackDto,
    };

    this.tracks[trackIndex] = updatedTrack;
    return updatedTrack;
  }

  deleteTrack(id: string): void {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid track ID format');
    }

    const trackIndex = this.tracks.findIndex(track => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }

    this.tracks.splice(trackIndex, 1);
  }

  handleArtistDeletion(artistId: string): void {
    this.tracks = this.tracks.map(track => {
      if (track.artistId === artistId) {
        return { ...track, artistId: null };
      }
      return track;
    });
  }

  handleAlbumDeletion(albumId: string): void {
    this.tracks = this.tracks.map(track => {
      if (track.albumId === albumId) {
        return { ...track, albumId: null };
      }
      return track;
    });
  }
} 
