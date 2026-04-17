import { toSessionDto } from "../dtos/auth-dto.js";
import { toUserDto } from "../dtos/user-dto.js";
import { AppError } from "../errors/app-error.js";
import { generateId, generateRandomToken, hashPassword, verifyPassword } from "../utils/crypto.js";
import { signAuthToken } from "../utils/token.js";

export class AuthService {
  constructor({
    userRepository,
    passwordResetTokenRepository,
    tokenSecret,
    resetTokenTtlMs,
    authTokenTtlMs
  }) {
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.tokenSecret = tokenSecret;
    this.resetTokenTtlMs = resetTokenTtlMs;
    this.authTokenTtlMs = authTokenTtlMs;
  }

  async register(payload) {
    this.validateRegistration(payload);

    const existingUser = this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError("El correo ya esta registrado.");
    }

    const timestamp = new Date().toISOString();
    const createdUser = this.userRepository.create({
      id: generateId("usr"),
      name: payload.name,
      email: payload.email,
      role: payload.role || "user",
      passwordHash: hashPassword(payload.password),
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return toUserDto(createdUser);
  }

  async login(payload) {
    if (!payload.email || !payload.password) {
      throw new AppError("Correo y contrasena son obligatorios.");
    }

    const user = this.userRepository.findByEmail(payload.email);

    if (!user || !verifyPassword(payload.password, user.password_hash)) {
      throw new AppError("Credenciales invalidas.", 401);
    }

    const token = signAuthToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        issuedAt: Date.now(),
        exp: Date.now() + this.authTokenTtlMs
      },
      this.tokenSecret
    );

    return toSessionDto(user, token);
  }

  async requestPasswordReset(payload) {
    if (!payload.email) {
      throw new AppError("El correo es obligatorio.");
    }

    const user = this.userRepository.findByEmail(payload.email);
    const token = generateRandomToken();
    const expiresAt = Date.now() + this.resetTokenTtlMs;

    if (user) {
      this.passwordResetTokenRepository.replaceForUser({
        id: generateId("rst"),
        userId: user.id,
        token,
        expiresAt,
        createdAt: new Date().toISOString()
      });
    }

    return {
      message: "Si el correo existe, se genero un token de recuperacion.",
      resetToken: token
    };
  }

  async resetPassword(payload) {
    if (!payload.token || !payload.password) {
      throw new AppError("Token y nueva contrasena son obligatorios.");
    }

    if (payload.password.length < 8) {
      throw new AppError("La contrasena debe tener al menos 8 caracteres.");
    }

    const resetEntry = this.passwordResetTokenRepository.findByToken(payload.token);
    if (!resetEntry || resetEntry.expires_at < Date.now()) {
      throw new AppError("Token de recuperacion invalido o expirado.");
    }

    const user = this.userRepository.findById(resetEntry.user_id);
    if (!user) {
      throw new AppError("Usuario asociado no encontrado.", 404);
    }

    const updatedUser = this.userRepository.update({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: hashPassword(payload.password),
      updatedAt: new Date().toISOString()
    });

    this.passwordResetTokenRepository.deleteByToken(payload.token);

    return {
      message: "Contrasena actualizada correctamente.",
      user: toUserDto(updatedUser)
    };
  }

  validateRegistration(payload) {
    if (!payload.name || !payload.email || !payload.password) {
      throw new AppError("Nombre, correo y contrasena son obligatorios.");
    }

    if (payload.password.length < 8) {
      throw new AppError("La contrasena debe tener al menos 8 caracteres.");
    }
  }
}
