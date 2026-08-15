// ============================================================================
// ÖZEL HATA SINIFLAR
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string, public conflict?: Record<string, any>) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'InternalServerError';
  }
}
