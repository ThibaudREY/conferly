"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
exports.app = express_1.default();
exports.app.get("/", function (req, res, next) {
    res.json({ message: "hello conferly" });
});
//# sourceMappingURL=server.js.map