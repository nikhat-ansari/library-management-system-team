import { Module } from '@nestjs/common';
import { LibrarianDashboardClient } from './librarian-dashboard.client';
import { LibrarianDashboardController } from './librarian-dashboard.controller';

@Module({ controllers: [LibrarianDashboardController], providers: [LibrarianDashboardClient] })
export class LibrarianDashboardModule {}
