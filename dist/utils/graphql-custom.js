"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQlErr = void 0;
class graphQlErr {
    constructor(message, status = 500, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.graphQlErr = graphQlErr;
//# sourceMappingURL=graphql-custom.js.map