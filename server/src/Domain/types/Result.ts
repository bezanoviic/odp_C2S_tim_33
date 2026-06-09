export enum ResultKind {
  SUCCESS         = "success",
  NOT_FOUND       = "not_found",
  FORBIDDEN       = "forbidden",
  CONFLICT        = "conflict",
  INVALID         = "invalid",
  INTERNAL_ERROR  = "internal_error",
}

export type Result<T = void> =
  | { kind: ResultKind.SUCCESS; data: T }
  | { kind: Exclude<ResultKind, ResultKind.SUCCESS>; message: string };

export const ok = <T>(data: T): Result<T> => ({ kind: ResultKind.SUCCESS, data });

export const fail = <T = void>(kind: Exclude<ResultKind, ResultKind.SUCCESS>, message: string): Result<T> =>
  ({ kind, message });
