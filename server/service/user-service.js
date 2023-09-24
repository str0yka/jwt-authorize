const bcrypt = require('bcrypt');
const uuid = require('uuid');

const prisma = require('../prisma');
const UserDto = require('../dtos/user-dto');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const ApiError = require('../exceptions/api-error');

class UserService {
  async registration(email, password) {
    const candidate = await prisma.user.findFirst({ where: { email } });

    if (candidate) {
      throw ApiError.BadRequest('Пользователь с такой почтой уже существует');
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    const user = await prisma.user.create({
      data: { email, password: hashPassword, activationLink },
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с такой почтой не существует');
    }

    const isPasswordsEqual = await bcrypt.compare(password, user.password);

    if (!isPasswordsEqual) {
      throw ApiError.BadRequest('Неверный пароль');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      throw new ApiError.UnauthorizedError();
    }

    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async active(activationLink) {
    const user = await prisma.user.findFirst({ where: { activationLink } });

    if (!user) {
      throw ApiError.BadRequest('Неккоректная ссылка активации');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActivated: true },
    });
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw new ApiError.UnauthorizedError();
    }

    const userFromDb = await prisma.user.findUnique({ where: { id: userData.id } });

    const userDto = new UserDto(userFromDb);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
  }

  async getAllUsers() {
    return prisma.user.findMany({ select: { id: true, email: true, isActivated: true } });
  }
}

module.exports = new UserService();
