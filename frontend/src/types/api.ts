export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
  error?: ApiError;
};

