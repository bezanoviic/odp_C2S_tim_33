export class AuditLog {
  constructor(
    public id: number = 0,
    public user_id: number | null = null,
    public action: string = "",
    public entity_type: string = "",
    public entity_id: number | null = null,
    public details: string | null = null,
    public created_at: Date = new Date(),
  ) {}
}