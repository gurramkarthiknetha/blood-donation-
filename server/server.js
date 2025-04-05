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
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
// Create uploads directory if it doesn't exist
const fs_1 = __importDefault(require("fs"));
if (!fs_1.default.existsSync('uploads')) {
    fs_1.default.mkdirSync('uploads');
}
// Configure CORS - update with specific origin
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));
// Serve static files for uploaded images
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Import routes
const admin_1 = __importDefault(require("./routes/admin"));
const doner_1 = __importDefault(require("./routes/doner"));
const receiver_1 = __importDefault(require("./routes/receiver"));
const port = process.env.PORT || 4000;
// Function to find an available port
const startServer = (initialPort) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.DBURL);
        console.log("DB connected Successfully");
        const server = app.listen(initialPort, () => {
            console.log(`Server running on port ${initialPort}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${initialPort} is busy, trying ${initialPort + 1}`);
                startServer(initialPort + 1);
            }
            else {
                console.error('Server error:', err);
            }
        });
    }
    catch (e) {
        console.log("Error in connecting to DB: ", e);
    }
});
// body parser - increase limit for file uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Use route middlewares
app.use('/api/admin', admin_1.default);
app.use('/api/donor', doner_1.default);
app.use('/api/receiver', receiver_1.default);
// error handler
app.use((err, req, res, next) => {
    console.error("Error occurred:", err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});
startServer(port);
