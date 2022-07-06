import { GraphQLError, GraphQLFormattedError } from "graphql";

type MessageError = {
  message: string;
};
export class graphQlErr implements GraphQLFormattedError {
  status: number;
  message: string;
  data?: MessageError[];
  constructor(message: string, status: number = 500, data?: MessageError[]) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
