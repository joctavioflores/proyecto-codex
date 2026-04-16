import { createPaginatedResponse } from "../dtos/pagination-dto.js";
import { AppError } from "../errors/app-error.js";
import { generateId } from "../utils/crypto.js";
import { normalizePagination } from "../utils/pagination.js";

export class CrudService {
  constructor({ repository, entityName, dtoMapper, inputFields }) {
    this.repository = repository;
    this.entityName = entityName;
    this.dtoMapper = dtoMapper;
    this.inputFields = inputFields;
  }

  async list(query = {}) {
    const totalItems = this.repository.countAll();
    const pagination = normalizePagination(query);
    const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
    const effectivePagination = {
      ...pagination,
      page: Math.min(pagination.page, totalPages)
    };
    const rows = this.repository.listPaginated(effectivePagination);

    return createPaginatedResponse(
      rows,
      {
        ...effectivePagination,
        totalItems
      },
      this.dtoMapper
    );
  }

  async create(payload) {
    this.validatePayload(payload);

    const timestamp = new Date().toISOString();
    const entity = this.mapEntity(
      {
        id: generateId(this.entityName),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      payload
    );

    const createdEntity = this.repository.create(entity);
    return this.dtoMapper(createdEntity);
  }

  async update(id, payload) {
    this.validatePayload(payload);

    const currentEntity = this.repository.findById(id);
    if (!currentEntity) {
      throw new AppError(`${this.entityName} no encontrado.`, 404);
    }

    const updatedEntity = this.repository.update(
      this.mapEntity(
        {
          id,
          createdAt: currentEntity.created_at,
          updatedAt: new Date().toISOString()
        },
        payload
      )
    );

    return this.dtoMapper(updatedEntity);
  }

  async remove(id) {
    const removed = this.repository.deleteById(id);
    if (!removed) {
      throw new AppError(`${this.entityName} no encontrado.`, 404);
    }
  }

  mapEntity(baseEntity, payload) {
    const entity = {
      ...baseEntity,
      name: payload.name
    };

    for (const field of this.inputFields) {
      entity[field] = payload[field];
    }

    return entity;
  }

  validatePayload(payload) {
    if (!payload.name || !String(payload.name).trim()) {
      throw new AppError("El campo name es obligatorio.");
    }

    for (const field of this.inputFields) {
      if (!payload[field] || !String(payload[field]).trim()) {
        throw new AppError(`El campo ${field} es obligatorio.`);
      }
    }
  }
}
