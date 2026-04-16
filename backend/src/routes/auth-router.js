import express from "express";
import {
  createForgotPasswordPayloadDto,
  createLoginPayloadDto,
  createRegisterPayloadDto,
  createResetPasswordPayloadDto
} from "../dtos/auth-dto.js";

export function createAuthRouter(authService) {
  const router = express.Router();

  router.post("/register", async (request, response, next) => {
    try {
      const user = await authService.register(createRegisterPayloadDto(request.body));
      response.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (request, response, next) => {
    try {
      const session = await authService.login(createLoginPayloadDto(request.body));
      response.status(200).json(session);
    } catch (error) {
      next(error);
    }
  });

  router.post("/forgot-password", async (request, response, next) => {
    try {
      const result = await authService.requestPasswordReset(
        createForgotPasswordPayloadDto(request.body)
      );
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/reset-password", async (request, response, next) => {
    try {
      const result = await authService.resetPassword(createResetPasswordPayloadDto(request.body));
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
