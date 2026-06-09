export class AuditLogDto {
  constructor(
    public id: number,
    public user_id: number | null,
    public gamer_tag: string | null,
    public action: string,
    public entity_type: string,
    public entity_id: number | null,
    public details: string | null,
    public created_at: Date,
  ) {}
}