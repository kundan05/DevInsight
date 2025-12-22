import { CorsOptions } from 'cors';

const whiteList = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin!) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export default corsOptions;
