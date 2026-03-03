import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false })
  const config = app.get(ConfigService)

  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const clientOrigin = config.get<string>('CLIENT_ORIGIN') ?? 'http://localhost:3000'
  app.enableCors({
    origin: clientOrigin,
    credentials: true,
  })

  const port = config.get<number>('PORT') ?? 3001
  await app.listen(port)
  const appUrl = await app.getUrl()
  Logger.log(`Backend connected and running at ${appUrl}`, 'Bootstrap')
}

bootstrap()
