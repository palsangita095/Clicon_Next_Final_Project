// User Role
export enum user_role {
  CUSTOMER = "customer",
  DRIVER = "driver",
  DISPATCHER = "dispatcher",
  ADMIN = "admin",
}

// Approval Status
export enum approval_status {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

// ! optionals

// Shipment Status
export enum shipment_status {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// Shipment Type
export enum shipment_type {
  STANDARD = "standard",
  EXPRESS = "express",
  FRAGILE = "fragile",
  HEAVY = "heavy",
  REFRIGERATED = "refrigerated",
  HAZARDOUS = "hazardous",
}

// Delivery Priority
export enum delivery_priority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

// Driver Status
export enum driver_status {
  AVAILABLE = "available",
  ON_DELIVERY = "on_delivery",
  OFF_DUTY = "off_duty",
  INACTIVE = "inactive",
}

// Vehicle Status
export enum vehicle_status {
  AVAILABLE = "available",
  ON_DELIVERY = "on_delivery",
  MAINTENANCE = "maintenance",
  INACTIVE = "inactive",
}

// Maintenance Status
export enum maintenance_status {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
}

// Notification Type
export enum notification_type {
  SHIPMENT_UPDATE = "shipment_update",
  DELIVERY_CONFIRMED = "delivery_confirmed",
  DELAY_ALERT = "delay_alert",
  DRIVER_ARRIVAL = "driver_arrival",
  ASSIGNMENT = "assignment",
  SYSTEM = "system",
}

// Document Type
export enum document_type {
  INVOICE = "invoice",
  DELIVERY_RECEIPT = "delivery_receipt",
  PROOF_OF_DELIVERY = "proof_of_delivery",
  SHIPMENT_EXPORT = "shipment_export",
  LICENSE = "license",
  INSURANCE = "insurance",
  VEHICLE_DOC = "vehicle_doc",
  OTHER = "other",
}

export enum shipment_priority {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
}

export enum verification_status {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
