import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LibrarianDashboardResponseDto } from './dto/librarian-dashboard-response.dto';
import { LibrarianDashboardService } from './librarian-dashboard.service';

@ApiTags('librarian-dashboard')
@ApiBearerAuth()
@Controller('librarian/dashboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles('LIBRARIAN_STAFF')
export class LibrarianDashboardController {
  constructor(private readonly dashboard: LibrarianDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Read the librarian daily operational dashboard', description: 'Uses the Asia/Kolkata library date. Seat bookings include non-cancelled bookings whose startAt falls on that date.' })
  @ApiOkResponse({ type: LibrarianDashboardResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'LIBRARIAN_STAFF role is required.' })
  @ApiServiceUnavailableResponse({ description: 'Returned only when the operational database is unavailable. AI unavailability never causes this response.' })
  getDashboard(): Promise<LibrarianDashboardResponseDto> { return this.dashboard.getDashboard(); }
}
