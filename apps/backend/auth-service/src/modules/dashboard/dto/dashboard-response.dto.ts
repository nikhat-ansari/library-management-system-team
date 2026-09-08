import { ApiProperty } from '@nestjs/swagger';

class FineSummaryDto { @ApiProperty() outstandingAmount!: number; @ApiProperty() pendingPayments!: number; }
class ReservationSummaryDto { @ApiProperty() pending!: number; @ApiProperty() readyForPickup!: number; }
class SeatUtilizationDto { @ApiProperty() occupied!: number; @ApiProperty() total!: number; @ApiProperty() percentage!: number; }
class ManagementSummaryDto { @ApiProperty() content!: string; @ApiProperty({ format: 'date-time' }) generatedAt!: string; }
class TrendAlertDto { @ApiProperty() id!: string; @ApiProperty() title!: string; @ApiProperty() description!: string; @ApiProperty({ enum: ['info', 'warning', 'critical'] }) severity!: 'info' | 'warning' | 'critical'; }

export class DashboardResponseDto {
  @ApiProperty() totalBooks!: number;
  @ApiProperty() totalMembers!: number;
  @ApiProperty() issuedBooks!: number;
  @ApiProperty() overdueBooks!: number;
  @ApiProperty({ type: FineSummaryDto }) fineSummary!: FineSummaryDto;
  @ApiProperty({ type: ReservationSummaryDto }) reservationSummary!: ReservationSummaryDto;
  @ApiProperty({ type: SeatUtilizationDto }) seatUtilization!: SeatUtilizationDto;
  @ApiProperty({ type: ManagementSummaryDto, nullable: true, description: 'Unavailable when AI infrastructure is unavailable' }) managementSummary!: ManagementSummaryDto | null;
  @ApiProperty({ type: [TrendAlertDto] }) trendAlerts!: TrendAlertDto[];
}
