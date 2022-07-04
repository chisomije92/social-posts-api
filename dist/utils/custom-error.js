"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode = 500, data) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=custom-error.js.map