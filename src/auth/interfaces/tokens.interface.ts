export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  login: string;
} 
