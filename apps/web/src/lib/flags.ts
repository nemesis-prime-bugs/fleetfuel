import { getEnv } from "@/lib/env";

export function receiptsEnabled(): boolean {
  return getEnv().RECEIPTS_MODE !== "disabled";
}
