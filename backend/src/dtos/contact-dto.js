export function toContactDto(row, fields) {
  const dto = {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  for (const field of fields) {
    dto[field] = row[field];
  }

  return dto;
}

export function createContactPayloadDto(payload, fields) {
  const dto = {
    name: payload.name?.trim()
  };

  for (const field of fields) {
    dto[field] = payload[field]?.trim();
  }

  return dto;
}
