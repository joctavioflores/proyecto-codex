import express from "express";
import { requireAuth } from "../middleware/auth-middleware.js";

export function createEntityRouter(service, { createDto, updateDto = createDto }) {
  const router = express.Router();
  router.use(requireAuth);

  router.get("/", async (request, response, next) => {
    try {
      const result = await service.list(request.query);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    try {
      const createdItem = await service.create(createDto(request.body));
      response.status(201).json(createdItem);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (request, response, next) => {
    try {
      const updatedItem = await service.update(request.params.id, updateDto(request.body));
      response.status(200).json(updatedItem);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    try {
      await service.remove(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
