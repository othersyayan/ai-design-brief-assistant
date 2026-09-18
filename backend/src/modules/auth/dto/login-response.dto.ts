export interface UserPayload {
  id: string;
  email: string;
  name: string | null;
}

export class LoginResponseDto {
  accessToken!: string;
  user!: UserPayload;
}
