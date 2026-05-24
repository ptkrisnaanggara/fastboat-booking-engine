import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase.service';

const ADMIN_TABLES = {
  ports: 'ports',
  operators: 'operators',
  vessels: 'vessels',
  routes: 'routes',
  schedules: 'schedules',
} as const;

type AdminResource = keyof typeof ADMIN_TABLES;

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  private table(resource: string): string {
    if (!Object.prototype.hasOwnProperty.call(ADMIN_TABLES, resource)) {
      throw new BadRequestException(`Unsupported admin resource: ${resource}`);
    }

    return ADMIN_TABLES[resource as AdminResource];
  }

  async list(resource: string) {
    const table = this.table(resource);
    const { data, error } = await this.supabase.client
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(resource: string, id: string) {
    const table = this.table(resource);
    const { data, error } = await this.supabase.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`${resource} not found`);
    return data;
  }

  async create(resource: string, payload: Record<string, unknown>) {
    const table = this.table(resource);
    const { data, error } = await this.supabase.client
      .from(table)
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(resource: string, id: string, payload: Record<string, unknown>) {
    const table = this.table(resource);
    const { data, error } = await this.supabase.client
      .from(table)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new NotFoundException(`${resource} not found`);
    return data;
  }

  async deactivate(resource: string, id: string) {
    const table = this.table(resource);
    const { data, error } = await this.supabase.client
      .from(table)
      .update({ is_active: false })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new NotFoundException(`${resource} not found`);
    return data;
  }
}
