import { ValidationError } from "express-validator";

type MessageError = {
  message: string;
};
export class CustomError extends Error {
  statusCode: number;
  message: string;
  data?: ValidationError[];
  constructor(
    message: string,
    statusCode: number = 500,
    data?: ValidationError[]
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
