export function toUserDto(userRow) {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at
  };
}

export function createUserPayloadDto(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    role: payload.role?.trim() || "user",
    password: payload.password
  };
}

export function updateUserPayloadDto(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    role: payload.role?.trim() || "user",
    password: payload.password?.trim() || undefined
  };
}
