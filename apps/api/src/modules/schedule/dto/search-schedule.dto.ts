import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchScheduleDto {
  @IsUUID()
  originPortId!: string;

  @IsUUID()
  destinationPortId!: string;

  @IsDateString()
  departureDate!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengers!: number;
}
