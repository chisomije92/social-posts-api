"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomGraphQlError = void 0;
class CustomGraphQlError {
    constructor(message, code = 500, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
exports.CustomGraphQlError = CustomGraphQlError;
//# sourceMappingURL=graphql-custom.js.map