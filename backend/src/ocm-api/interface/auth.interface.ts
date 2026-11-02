export interface AuthResponse {
  result: string;
  description?: string;
  data?: AuthData;
}

interface AuthData {
  name: string;
  token: string;
}