const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30s' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (err) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await prisma.token.findUnique({ where: { userId } });

    if (tokenData) {
      return prisma.token.update({ where: { userId }, data: { refreshToken } });
    }

    return prisma.token.create({ data: { userId, refreshToken } });
  }

  async removeToken(refreshToken) {
    return prisma.token.deleteMany({ where: { refreshToken } });
  }

  async findToken(refreshToken) {
    return prisma.token.findFirst({ where: { refreshToken } });
  }
}

module.exports = new TokenService();
