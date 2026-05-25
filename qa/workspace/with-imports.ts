import { formatDate } from './src/format-date';
import { logger } from './src/logger';
import type { User } from './src/models/user.model';

export function bootstrap(user: User): void {
  logger.info(`Booted at ${formatDate(new Date())} for ${user.email}`);
}
