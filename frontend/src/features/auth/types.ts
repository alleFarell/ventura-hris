export type UserSummary = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
};

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};
