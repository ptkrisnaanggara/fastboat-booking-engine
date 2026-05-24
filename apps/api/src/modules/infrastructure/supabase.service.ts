import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(@Inject('SUPABASE_CLIENT') public readonly client: SupabaseClient) {}

  async insertOne<T>(table: string, payload: unknown): Promise<T> {
    const { data, error } = await this.client.from(table).insert(payload).select('*').single();
    if (error) throw error;
    return data as T;
  }

  async updateOne<T>(table: string, id: string, payload: unknown): Promise<T> {
    const { data, error } = await this.client.from(table).update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data as T;
  }
}
