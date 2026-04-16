export function createPaginatedResponse(rows, { page, pageSize, totalItems }, mapper) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  return {
    items: rows.map((row) => mapper(row)),
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    }
  };
}
