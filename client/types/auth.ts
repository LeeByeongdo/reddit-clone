export interface RegisterError {
  email?: string;
  username?: string;
  password?: string;
}

export interface LoginError {
  username?: string;
  password?: string;
}