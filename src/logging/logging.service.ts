import { Injectable, LoggerService, Logger, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: Logger;
  private logStream: fs.WriteStream;
  private errorLogStream: fs.WriteStream;
  private readonly maxFileSize: number;
  private readonly logDir: string;
  private readonly logLevels: LogLevel[];

  constructor() {
    this.logger = new Logger();
    this.logDir = process.env.LOG_DIR || 'logs';
    this.maxFileSize = parseInt(process.env.LOG_MAX_FILE_SIZE || '1024', 10);

    const configuredLevel = process.env.LOG_LEVEL?.toLowerCase() || 'log';
    this.logLevels = this.getLogLevels(configuredLevel);

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.logStream = this.createLogStream('combined.log');
    this.errorLogStream = this.createLogStream('error.log');

    process.on('uncaughtException', (error) => {
      this.error('Uncaught Exception', error.stack);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      const errorMessage =
        reason instanceof Error ? reason.message : String(reason);
      this.error('Unhandled Rejection', errorMessage);
    });
  }

  private getLogLevels(level: string): LogLevel[] {
    const allLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
    const levelIndex = allLevels.indexOf(level as LogLevel);
    return levelIndex >= 0
      ? allLevels.slice(0, levelIndex + 1)
      : ['error', 'warn', 'log'];
  }

  private createLogStream(filename: string): fs.WriteStream {
    return fs.createWriteStream(path.join(this.logDir, filename), {
      flags: 'a',
    });
  }

  private rotateLogFile(filename: string): void {
    const filePath = path.join(this.logDir, filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFilePath = path.join(this.logDir, `${filename}.${timestamp}`);

    if (filename === 'combined.log') {
      this.logStream.end();
      this.logStream = this.createLogStream(filename);
    } else {
      this.errorLogStream.end();
      this.errorLogStream = this.createLogStream(filename);
    }

    fs.renameSync(filePath, rotatedFilePath);

    const files = fs
      .readdirSync(this.logDir)
      .filter((file) => file.startsWith(filename))
      .sort()
      .reverse();

    if (files.length > 5) {
      files.slice(5).forEach((file) => {
        fs.unlinkSync(path.join(this.logDir, file));
      });
    }
  }

  private checkFileSize(filename: string): boolean {
    const filePath = path.join(this.logDir, filename);
    try {
      const stats = fs.statSync(filePath);
      return stats.size >= this.maxFileSize * 1024;
    } catch (error) {
      return false;
    }
  }

  private writeToFile(message: string, isError: boolean = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    if (isError && this.checkFileSize('error.log')) {
      this.rotateLogFile('error.log');
    }
    if (this.checkFileSize('combined.log')) {
      this.rotateLogFile('combined.log');
    }

    if (isError) {
      this.errorLogStream.write(logMessage);
    }
    this.logStream.write(logMessage);
  }

  log(message: string, context?: string) {
    if (this.logLevels.includes('log')) {
      this.logger.log(message, context);
      this.writeToFile(`[INFO] ${context ? `[${context}] ` : ''}${message}`);
    }
  }

  error(message: string, trace?: string, context?: string) {
    if (this.logLevels.includes('error')) {
      this.logger.error(message, trace, context);
      this.writeToFile(
        `[ERROR] ${context ? `[${context}] ` : ''}${message}${trace ? `\n${trace}` : ''}`,
        true,
      );
    }
  }

  warn(message: string, context?: string) {
    if (this.logLevels.includes('warn')) {
      this.logger.warn(message, context);
      this.writeToFile(`[WARN] ${context ? `[${context}] ` : ''}${message}`);
    }
  }

  debug(message: string, context?: string) {
    if (this.logLevels.includes('debug')) {
      this.logger.debug(message, context);
      this.writeToFile(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (this.logLevels.includes('verbose')) {
      this.logger.verbose(message, context);
      this.writeToFile(`[VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
    }
  }
}
