// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { Module, Logger } from '@nestjs/common';
// import * as fs from 'fs';
// import * as https from 'https';
// import * as bodyParser from 'body-parser';
// import  {corsOptions}  from './middlewares/cors/cors.controller'
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { Base64Interceptor } from './middlewares/Base64Interceptor/Base64Interceptor';


// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
//     rawBody: true,
//   });

//   app.enableCors(corsOptions)
//   let httpsOptions
  // console.log(process.env.NODE_ENV,"process.env.NODE_ENV")
  // if (process.env.NODE_ENV  === 'development') {
  //    app.listen(process.env.PORT, () => {
  //     Logger.log(`HTTP Server running on port ${process.env.PORT}`)
  //     console.log(`HTTP Server running on port ${process.env.PORT}`);
  //   });
  // } else if (process.env.NODE_ENV  === 'production') {
    // const sslConfig = JSON.parse(process.env.ssl || '{}');
    //  httpsOptions = {
    //   key: fs.readFileSync(`./SSL/ssl.key`),  // Private key
    //   cert: fs.readFileSync(`./SSL/ssl.cert`) // Certificate
    // };


    // console.log('SSL Configuration Loaded Successfully');

    // if (httpsOptions) {
    //   // Create an HTTPS server
    //   const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
      
    //   httpsServer.listen(3008, () => {
    //     Logger.log(`🚀 HTTPS Server running on port ${3008}`);
  
    // } else {
      // Run HTTP in Development Mode
    //    app.listen(3008, () => {
    //     Logger.log(`🚀 HTTP Server running on port ${3008}`);
    //   });
    // }

    
//   }

// }
// bootstrap();



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as https from 'https';
import { corsOptions } from './middlewares/cors/cors.controller';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
    rawBody: true,
  });

  // 🔹 Enable CORS (your existing config)
  app.enableCors(corsOptions);

  // 🔹 Increase payload size limit (must come before other middleware)
  app.use(express.json({ limit: '50mb', verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }, }));
  app.use(express.urlencoded({ limit: '50mb', extended: true ,verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }, }));

  // 🔹 REQUIRED for HTTPS + CORS (Preflight Fix)
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  console.log('NODE_ENV:', process.env.PORT);
const port = process.env.PORT || 3000;  //3007
  // =======================
  // DEVELOPMENT → HTTP
  // =======================
  if (process.env.NODE_ENV === 'development') {
    

    await app.listen(port);
    Logger.log(`🚀 HTTP Server running on port ${port}`);
  }

  // =======================
  // PRODUCTION → HTTPS
  // =======================
  else if (process.env.NODE_ENV === 'production') {
    const httpsOptions = {
      key: fs.readFileSync('./SSL/ssl.key'),
      cert: fs.readFileSync('./SSL/ssl.cert'),
    };
    await app.init();
    const httpsServer = https.createServer(
      httpsOptions,
      app.getHttpAdapter().getInstance()
    );

    httpsServer.listen(port, () => {
      Logger.log(`🚀 HTTPS Server running on port ${port}`);
    });
  }
}

bootstrap();
