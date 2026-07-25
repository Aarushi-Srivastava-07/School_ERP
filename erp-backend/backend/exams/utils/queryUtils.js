"use strict";

const normalizeIds = (ids = []) => [...new Set(
  (Array.isArray(ids) ? ids : [ids])
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => String(value))
)];

const normalizePage = (page) => {
  const value = Number(page);
  return Number.isNaN(value) ? 1 : Math.max(1, value);
};

const normalizeLimit = (limit, defaultLimit = 10) => {
  const value = Number(limit);
  return Number.isNaN(value) ? defaultLimit : Math.max(1, value);
};

const getSortOrder = (order) =>
  String(order || '').toLowerCase() === 'desc' ? 'desc' : 'asc';

const applyMemoryFilters = (rows, filters = {}, mapFilterKey = (key) => key) => rows.filter((row) =>
  Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    const column = mapFilterKey(key);
    const rowValue = row?.[column];

    if (Array.isArray(value)) {
      return value.some((entry) => String(entry) === String(rowValue));
    }

    return String(rowValue) === String(value);
  })
);

const sortRows = (rows, sortBy, order, allowedColumns, defaultSortBy = 'created_at') => {
  const requestedColumn = String(sortBy || '').trim();
  const safeSortBy = allowedColumns.includes(requestedColumn) ? requestedColumn : defaultSortBy;
  const direction = getSortOrder(order) === 'desc' ? -1 : 1;

  return [...rows].sort((left, right) => {
    const leftValue = left?.[safeSortBy];
    const rightValue = right?.[safeSortBy];

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === undefined || leftValue === null) {
      return 1;
    }

    if (rightValue === undefined || rightValue === null) {
      return -1;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
};

const paginateRows = (rows, page, limit) => {
  const safePage = normalizePage(page);
  const safeLimit = normalizeLimit(limit);
  const start = (safePage - 1) * safeLimit;
  const sliced = rows.slice(start, start + safeLimit);

  return {
    success: true,
    page: safePage,
    limit: safeLimit,
    total: rows.length,
    totalPages: rows.length === 0 ? 0 : Math.ceil(rows.length / safeLimit),
    data: sliced,
  };
};

const applySupabaseFilters = (query, filters = {}, mapFilterKey = (key) => key) => {
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    const column = mapFilterKey(key);
    if (Array.isArray(value) && value.length > 0) {
      query = query.in(column, value);
      return;
    }

    query = query.eq(column, value);
  });

  return query;
};

const applySupabaseSortAndRange = (query, sortBy, order, allowedColumns, defaultSortBy = 'created_at', page = 1, limit = 10) => {
  const sortColumn = allowedColumns.includes(String(sortBy || '')) ? String(sortBy) : defaultSortBy;
  const ascending = getSortOrder(order) !== 'desc';
  const safePage = normalizePage(page);
  const safeLimit = normalizeLimit(limit);
  const start = (safePage - 1) * safeLimit;

  if (typeof query.order === 'function') {
    query = query.order(sortColumn, { ascending });
  }

  if (typeof query.range === 'function') {
    query = query.range(start, start + safeLimit - 1);
  }

  return { query, safePage, safeLimit };
};

module.exports = {
  normalizeIds,
  normalizePage,
  normalizeLimit,
  getSortOrder,
  applyMemoryFilters,
  sortRows,
  paginateRows,
  applySupabaseFilters,
  applySupabaseSortAndRange,
};
