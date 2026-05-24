import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase.service';

export type AuditLogInput = {
  action: string;
  resource: string;
  resourceId?: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  actorType?: string;
  actorId?: string;
};

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async record(input: AuditLogInput): Promise<void> {
    const { error } = await this.supabase.client.from('audit_logs').insert({
      actor_type: input.actorType ?? 'system',
      actor_id: input.actorId,
      action: input.action,
      resource: input.resource,
      resource_id: input.resourceId,
      before_data: input.beforeData,
      after_data: input.afterData,
      metadata: input.metadata,
    });

    if (error) {
      this.logger.warn(`Failed to write audit log: ${error.message}`);
    }
  }
}
