import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const allowed = JSON.parse(process.env.Cors);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowed.allowedOrigins.includes('*')) {
      callback(null, true);  // Allow all origins
    } else if (allowed.allowedOrigins.includes(origin)) {
      callback(null, true);  // Allow specific origins
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: allowed.allowedMethods || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
