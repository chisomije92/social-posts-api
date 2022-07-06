"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const graphql_custom_1 = require("../utils/graphql-custom");
const resolvers = {
    createUser: ({ userInput }, req) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, password } = userInput;
        const errors = [];
        if (!validator_1.default.isEmail(email)) {
            errors.push({ message: "Email is invalid" });
        }
        if (validator_1.default.isEmpty(password) ||
            !validator_1.default.isLength(password, { min: 5 })) {
            errors.push({ message: "Password is too short" });
        }
        if (errors.length > 0) {
            const error = new graphql_custom_1.CustomGraphQlError("Validation failed, entered data is incorrect", 500, errors);
            throw error;
        }
        const existingUser = yield user_1.default.findOne({ email: email });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = new user_1.default({
            email: email,
            password: hashedPassword,
            name: name,
        });
        const createdUser = yield user.save();
        console.log(createdUser.toObject());
        return Object.assign(Object.assign({}, createdUser.toObject()), { password: null, _id: createdUser._id.toString() });
    }),
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map