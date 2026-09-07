export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T;
  public meta?: Record<string, any>;

  constructor(statusCode: number, message: string, data: T, meta?: Record<string, any>) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static success<T>(data: T, message = 'Success', statusCode = 200, meta?: Record<string, any>) {
    return new ApiResponse(statusCode, message, data, meta);
  }

  static created<T>(data: T, message = 'Created successfully') {
    return new ApiResponse(201, message, data);
  }
}
