import { ApiProperty } from '@nestjs/swagger';

class FineSummaryDto { @ApiProperty() outstandingAmount!: number; @ApiProperty() pendingPayments!: number; }
class ReservationSummaryDto { @ApiProperty() pending!: number; @ApiProperty() readyForPickup!: number; }
class SeatUtilizationDto { @ApiProperty() occupied!: number; @ApiProperty() total!: number; @ApiProperty() percentage!: number; }
class ManagementSummaryDto { @ApiProperty() content!: string; @ApiProperty({ format: 'date-time' }) generatedAt!: string; }
class TrendAlertDto { @ApiProperty() id!: string; @ApiProperty() title!: string; @ApiProperty() description!: string; @ApiProperty({ enum: ['info', 'warning', 'critical'] }) severity!: 'info' | 'warning' | 'critical'; }

export class DashboardResponseDto {
  @ApiProperty() totalBooks!: number;
  @ApiProperty() totalMembers!: number;
  @ApiProperty({ nullable: true, description: 'Unavailable until the circulation collection exists' }) issuedBooks!: number | null;
  @ApiProperty({ nullable: true, description: 'Unavailable until the circulation collection and due-date rules exist' }) overdueBooks!: number | null;
  @ApiProperty({ type: FineSummaryDto, nullable: true }) fineSummary!: FineSummaryDto | null;
  @ApiProperty({ type: ReservationSummaryDto, nullable: true }) reservationSummary!: ReservationSummaryDto | null;
  @ApiProperty({ type: SeatUtilizationDto, nullable: true }) seatUtilization!: SeatUtilizationDto | null;
  @ApiProperty({ type: ManagementSummaryDto, nullable: true, description: 'Unavailable when AI infrastructure is unavailable' }) managementSummary!: ManagementSummaryDto | null;
  @ApiProperty({ type: [TrendAlertDto] }) trendAlerts!: TrendAlertDto[];
  @ApiProperty({ type: [String], description: 'Dashboard metrics whose source is not implemented or available' }) unavailableDependencies!: string[];
}
