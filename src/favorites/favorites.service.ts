import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException, Inject, forwardRef } from '@nestjs/common';
import { Favorites, FavoritesResponse } from './interfaces/favorites.interface';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class FavoritesService {
  private favorites: Favorites = {
    artists: [],
    albums: [],
    tracks: [],
  };

  constructor(
    @Inject(forwardRef(() => ArtistsService))
    private readonly artistsService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private readonly albumsService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private readonly tracksService: TracksService,
  ) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  getAllFavorites(): FavoritesResponse {
    const artists = this.favorites.artists
      .map(id => this.artistsService.getArtistById(id))
      .filter(artist => artist !== null);
    
    const albums = this.favorites.albums
      .map(id => this.albumsService.getAlbumById(id))
      .filter(album => album !== null);
    
    const tracks = this.favorites.tracks
      .map(id => this.tracksService.getTrackById(id))
      .filter(track => track !== null);

    return { artists, albums, tracks };
  }

  addTrackToFavorites(trackId: string): void {
    if (!this.isValidUUID(trackId)) {
      throw new BadRequestException('Invalid track ID format');
    }

    try {
      this.tracksService.getTrackById(trackId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException('Track not found');
      }
      throw error;
    }

    if (this.favorites.tracks.includes(trackId)) {
      return;
    }

    this.favorites.tracks.push(trackId);
  }

  removeTrackFromFavorites(trackId: string): void {
    if (!this.isValidUUID(trackId)) {
      throw new BadRequestException('Invalid track ID format');
    }

    const index = this.favorites.tracks.indexOf(trackId);
    if (index === -1) {
      throw new NotFoundException('Track is not in favorites');
    }

    this.favorites.tracks.splice(index, 1);
  }

  addAlbumToFavorites(albumId: string): void {
    if (!this.isValidUUID(albumId)) {
      throw new BadRequestException('Invalid album ID format');
    }

    try {
      this.albumsService.getAlbumById(albumId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException('Album not found');
      }
      throw error;
    }

    if (this.favorites.albums.includes(albumId)) {
      return;
    }

    this.favorites.albums.push(albumId);
  }

  removeAlbumFromFavorites(albumId: string): void {
    if (!this.isValidUUID(albumId)) {
      throw new BadRequestException('Invalid album ID format');
    }

    const index = this.favorites.albums.indexOf(albumId);
    if (index === -1) {
      throw new NotFoundException('Album is not in favorites');
    }

    this.favorites.albums.splice(index, 1);
  }

  addArtistToFavorites(artistId: string): void {
    if (!this.isValidUUID(artistId)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    try {
      this.artistsService.getArtistById(artistId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException('Artist not found');
      }
      throw error;
    }

    if (this.favorites.artists.includes(artistId)) {
      return;
    }

    this.favorites.artists.push(artistId);
  }

  removeArtistFromFavorites(artistId: string): void {
    if (!this.isValidUUID(artistId)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const index = this.favorites.artists.indexOf(artistId);
    if (index === -1) {
      throw new NotFoundException('Artist is not in favorites');
    }

    this.favorites.artists.splice(index, 1);
  }

  handleTrackDeletion(trackId: string): void {
    const index = this.favorites.tracks.indexOf(trackId);
    if (index !== -1) {
      this.favorites.tracks.splice(index, 1);
    }
  }

  handleAlbumDeletion(albumId: string): void {
    const index = this.favorites.albums.indexOf(albumId);
    if (index !== -1) {
      this.favorites.albums.splice(index, 1);
    }
  }

  handleArtistDeletion(artistId: string): void {
    const index = this.favorites.artists.indexOf(artistId);
    if (index !== -1) {
      this.favorites.artists.splice(index, 1);
    }
  }
} 
