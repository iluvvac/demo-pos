export type UserRole = "ADMIN" | "CS" | "EDITOR" | "KASIR" | "PRODUKSI" | "GUDANG"

export const ORDER_STATUSES = [
  "ANTRIAN_BARU",
  "INQUIRY",
  "MENUNGGU_FILE_DESAIN",
  "SELESAI_EDIT_MENUNGGU_PEMBAYARAN",
  "SUDAH_DIBAYAR_MENUNGGU_PRODUKSI",
  "ON_PROCESS_CUTTING",
  "ON_PROCESS_PRINTING",
  "ON_PROCESS_FINISHING",
  "QC_CHECKING",
  "READY_FOR_PICKUP",
  "BARANG_SUDAH_DIAMBIL",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type PaymentStatus = "UNPAID" | "DP" | "PAID"

export interface DashboardMetrics {
  total_orders: number
  done_today: number
  in_progress: number
  delayed: number
}
