export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createError = (statusCode: number, message: string) => {
  return new AppError(statusCode, message);
};

// Common errors
export const ERRORS = {
  UNAUTHORIZED: createError(401, "Unauthorized"),
  FORBIDDEN: createError(403, "Forbidden"),
  NOT_FOUND: createError(404, "Not found"),
  BAD_REQUEST: createError(400, "Bad request"),
  CONFLICT: createError(409, "Conflict"),
  INTERNAL_SERVER_ERROR: createError(500, "Internal server error"),
};
