export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;
