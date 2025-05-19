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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const courseModel_1 = require("./models/courseModel");
/* ROUTE IMPORTS */
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
/* CONFIGURATIONS */
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/courses", courseRoutes_1.default);
// Database connection and server start
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, courseModel_1.initializeDatabase)();
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
});
startServer();
