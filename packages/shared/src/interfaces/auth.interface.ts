import { IUser } from './user.interface';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse extends IAuthTokens {
  user: IUser;
}
