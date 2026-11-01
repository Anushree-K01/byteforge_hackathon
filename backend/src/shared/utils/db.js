import { AppError, Errors } from '../errors/AppError.js';

export function throwIfDbError(error, fallback = 'Database request failed') {
  if (!error) return;
  const message = error.message || fallback;
  if (message.toLowerCase().includes('row-level security')) {
    throw Errors.forbidden();
  }
  if (error.code === '23505') {
    throw Errors.conflict('A record with those unique values already exists.');
  }
  if (error.code === '23503') {
    throw Errors.validation('Related record was not found.');
  }
  if (error.code === '23514' || message.includes('must belong to the same user')) {
    throw Errors.validation(message);
  }
  throw new AppError(fallback, { status: 502, code: 'DATABASE_ERROR' });
}

export async function requireOwnedRow(query, notFoundMessage) {
  const { data, error } = await query.maybeSingle();
  throwIfDbError(error);
  if (!data) throw Errors.notFound(notFoundMessage);
  return data;
}
