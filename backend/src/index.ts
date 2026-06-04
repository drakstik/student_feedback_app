import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
// import { body, validationResult } from 'express-validator';
// eslint-disable-next-line n/no-missing-import
import initUserModel, { User } from "./models/user.js";
import session from "express-session";
import registerRoute from './routes/register.js';
import { helloRoute } from './routes/hello.js';
import loginRoute from './routes/login.js';
import logoutRoute from './routes/logout.js';


dotenv.config();

// eslint-disable-next-line sonarjs/x-powered-by
const app = express();
const PORT = Number(process.env.PORT) || 5000;
// const SequelizeStore = ConnectSessionSequelize(session.Store); // Constructor
const router = express.Router();

// Only parses json and only looks at requests where the Content-Type header matches the type option.
app.use(express.json());
app.set('trust proxy', 1); // When running nginx reverse proxy (https://expressjs.com/en/guide/behind-proxies/)


app.use((req, res, next) => {
    console.log(`[Backend Incoming Request]: ${req.method} ${req.url}`);
    next();
});
// Create a session store in db

// Initialize the database connection
const sequelize = new Sequelize(
    process.env.DB_NAME || "dev_db",
    process.env.DB_USER || "dev_user",
    process.env.DB_PASSWORD || "dev_password",
    {
        host: process.env.DB_HOSTNAME || 'db', // or your DB host
        dialect: 'postgres'
    }
);
// 2. IMPORTANT: Initialize the model
// This runs User.init() inside your model file
initUserModel(sequelize, DataTypes);


// 1. Initialize the Valkey/Redis client
// By default, it connects to localhost:6379
const valkeyClient = createClient({
    url: process.env.VALKEY_URL || 'redis://localhost:6379',
    socket: {
        // Keeps the socket connection alive
        keepAlive: true,
        // Tells the client how to wait before trying to reconnect
        reconnectStrategy: (retries) => {
            console.log(`[Valkey] Connection lost. Reconnect attempt #${retries}...`);
            return Math.min(retries * 500, 3000); // Wait up to 3 seconds between retries
        }
    }
});

valkeyClient.on('error', (err) => console.error('Valkey Client Error:', err));
valkeyClient.on('connect', () => console.log('Successfully connected to Valkey!'));

// Connect to the Valkey server
await valkeyClient.connect();

// 2. Initialize the connect-redis store with your Valkey client
const valkeyStore = new RedisStore({
    client: valkeyClient,
    prefix: "sess:", // Optional: Prefixes all session keys in Valkey
});

app.use(
    session({
        secret: process.env.SESSION_SECRET || "random long text", // Must be a long, random string (e.g., 64 chars)
        store: valkeyStore,
        resave: false,                      // Avoids resaving unmodified sessions
        saveUninitialized: false,           // Complies with GDPR/privacy laws; only creates session on login
        name: '__Host-psid',                // Obfuscates the default 'connect.sid' cookie name
        cookie: {
            httpOnly: true,                   // Prevents XSS attacks from reading the cookie
            secure: true,                     // Requires HTTPS (MUST be true in production)
            sameSite: 'strict',               // Protects against CSRF attacks
            maxAge: 72 * 60 * 60 * 1000,      // Cookie expires in 3 days
        },
    })
);



// 4. sync your db schema without the use of migration files (only for development)
// This will sync you model changes with the db schema. Be careful with renaming tables as their
// data may be dropped. To rename tables and other complex model changes, use migration files. 
await sequelize.sync({ alter: true });


/*------------Example message from backend-----------*/
app.get("/api/hello_backend", helloRoute);

/*------------User registration logic-------------*/
app.use("/api/register", registerRoute);

/*------------User login logic------------*/
// Rate limiting for login attempts
export const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // Limit each IP to 5 failed login attempts per window
    message: 'Too many login attempts from this IP, please try again after 2 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use("/api/login", loginLimiter, loginRoute); // Protect login route with rate limiter

/*------------User logout logic------------*/
app.use("/api/logout", logoutRoute); // Mount the secure logout endpoint


//


// Start Express listener server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
