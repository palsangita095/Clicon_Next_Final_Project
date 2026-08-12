// Standard API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
