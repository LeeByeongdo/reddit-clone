export interface RegisterError {
  email?: string;
  username?: string;
  password?: string;
}

export interface LoginError {
  username?: string;
  password?: string;
}

export interface User {
  username: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
