import { $api } from '~/utils/http';

export class AuthService {
  static async registration(email: string, password: string) {
    return $api.post<LoginResponse>('/registration', { email, password });
  }

  static async login(email: string, password: string) {
    return $api.post<LoginResponse>('/login', { email, password });
  }

  static async logout(email: string, password: string) {
    return $api.post<void>('/login', { email, password });
  }

  static async refresh(email: string, password: string) {
    return $api.post<LoginResponse>('/login', { email, password });
  }
}
