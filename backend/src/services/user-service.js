import { createPaginatedResponse } from "../dtos/pagination-dto.js";
import { toUserDto } from "../dtos/user-dto.js";
import { AppError } from "../errors/app-error.js";
import { generateId, hashPassword } from "../utils/crypto.js";
import { normalizePagination } from "../utils/pagination.js";

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async list(query = {}) {
    const totalItems = this.userRepository.countAll();
    const pagination = normalizePagination(query);
    const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
    const effectivePagination = {
      ...pagination,
      page: Math.min(pagination.page, totalPages)
    };
    const rows = this.userRepository.listPaginated(effectivePagination);

    return createPaginatedResponse(
      rows,
      {
        ...effectivePagination,
        totalItems
      },
      toUserDto
    );
  }

  async create(payload) {
    this.validateForCreate(payload);
    this.ensureUniqueEmail(payload.email);

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

  async update(id, payload) {
    this.validateForUpdate(payload);

    const currentUser = this.userRepository.findById(id);
    if (!currentUser) {
      throw new AppError("usuario no encontrado.", 404);
    }

    if (payload.email !== currentUser.email) {
      this.ensureUniqueEmail(payload.email, id);
    }

    const updatedUser = this.userRepository.update({
      id,
      name: payload.name,
      email: payload.email,
      role: payload.role || currentUser.role,
      passwordHash: payload.password ? hashPassword(payload.password) : currentUser.password_hash,
      updatedAt: new Date().toISOString()
    });

    return toUserDto(updatedUser);
  }

  async remove(id) {
    const removed = this.userRepository.deleteById(id);
    if (!removed) {
      throw new AppError("usuario no encontrado.", 404);
    }
  }

  ensureUniqueEmail(email, ignoredId = null) {
    const existingUser = this.userRepository.findByEmail(email);
    if (existingUser && existingUser.id !== ignoredId) {
      throw new AppError("El correo ya esta registrado.");
    }
  }

  validateForCreate(payload) {
    if (!payload.name || !payload.email || !payload.password) {
      throw new AppError("Nombre, correo y contrasena son obligatorios.");
    }

    if (payload.password.length < 8) {
      throw new AppError("La contrasena debe tener al menos 8 caracteres.");
    }
  }

  validateForUpdate(payload) {
    if (!payload.name || !payload.email) {
      throw new AppError("Nombre y correo son obligatorios.");
    }

    if (payload.password && payload.password.length < 8) {
      throw new AppError("La contrasena debe tener al menos 8 caracteres.");
    }
  }
}
