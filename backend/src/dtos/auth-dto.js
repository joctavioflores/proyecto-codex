import { toUserDto } from "./user-dto.js";

export function createLoginPayloadDto(payload) {
  return {
    email: payload.email?.trim().toLowerCase(),
    password: payload.password
  };
}

export function createRegisterPayloadDto(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    role: payload.role?.trim() || "user",
    password: payload.password
  };
}

export function createForgotPasswordPayloadDto(payload) {
  return {
    email: payload.email?.trim().toLowerCase()
  };
}

export function createResetPasswordPayloadDto(payload) {
  return {
    token: payload.token?.trim(),
    password: payload.password
  };
}

export function toSessionDto(userRow, token) {
  return {
    token,
    user: toUserDto(userRow)
  };
}
