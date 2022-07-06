import { GraphQLError, GraphQLFormattedError } from "graphql";

type MessageError = {
  message: string;
};
export class CustomGraphQlError implements GraphQLFormattedError {
  code: number;
  message: string;
  data?: MessageError[];
  constructor(message: string, code: number = 500, data?: MessageError[]) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
