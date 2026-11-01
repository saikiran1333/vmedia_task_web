export type PanelState<T> =
  | { status: "ready"; data: T }
  | { status: "error"; title: string; detail: string; action: string };
