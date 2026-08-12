export interface AdminDashboard {
  statistics: DashboardStatistics;
  shipment_analytics: ShipmentAnalytics;
  delivery_analytics: DeliveryAnalytics;
  customer_analytics: CustomerAnalytics;
  driver_analytics: DriverAnalytics;
  dispatcher_analytics: DispatcherAnalytics;
  vehicle_analytics: VehicleAnalytics;
  fuel_analytics: FuelAnalytics;
  route_analytics: RouteAnalytics;
  recent_activities: RecentActivity[];
}

export interface DashboardStatistics {
  total_shipments: number;
  total_customers: number;
  total_drivers: number;
  total_dispatchers: number;
  total_vehicles: number;
  total_routes: number;
  total_revenue: number;
  active_deliveries: number;
}

export interface ShipmentAnalytics {
  pending: number;
  assigned: number;
  in_transit: number;
  delivered: number;
  cancelled: number;
}

export interface DeliveryAnalytics {
  today: number;
  this_week: number;
  this_month: number;
  completed: number;
  failed: number;
}

export interface CustomerAnalytics {
  active_customers: number;
  inactive_customers: number;
  new_customers: number;
  top_customer: string | null;
}

export interface DriverAnalytics {
  available: number;
  busy: number;
  offline: number;
  average_rating: number;
  top_driver: string | null;
}

export interface DispatcherAnalytics {
  active_dispatchers: number;
  total_assignments: number;
  pending_assignments: number;
}

export interface VehicleAnalytics {
  available: number;
  assigned: number;
  maintenance: number;
  inactive: number;
}

export interface FuelAnalytics {
  total_refuels: number;
  total_liters: number;
  total_cost: number;
  average_cost_per_refuel: number;
}

export interface RouteAnalytics {
  total_routes: number;
  active_routes: number;
  completed_routes: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: string;
}
