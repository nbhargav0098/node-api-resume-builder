export class ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
