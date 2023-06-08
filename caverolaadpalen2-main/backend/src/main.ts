import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
  // run index.js file located in the gmail folder
  const gmailReader = require('./gmail/gmailreader.service');
  gmailReader.main();

  //const gmailSend = require('./gmail/gmailsend.service');
  //gmailSend.main('izzetsamil2@gmail.com', 'test1', 'test2'); // to, subject, message

}

bootstrap();
