import { $api } from '~/utils/http';

export class UserService {
  static async getAllUsers(email: string, password: string) {
    return $api.get<GetAllUsersResponse>('/users');
  }
}
