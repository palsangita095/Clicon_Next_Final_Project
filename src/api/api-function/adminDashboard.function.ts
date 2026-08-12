import { supabase } from "@/lib/supabase.config";
import { getErrorMessage } from "@/services/helper/global.helper";

// ! fetch admin dashboard analytics
export const getAdminDashboardFns = async () => {
  try {
    const [
      shipmentsRes,
      deliveriesRes,
      customersRes,
      driversRes,
      dispatchersRes,
      vehiclesRes,
      routesRes,
      fuelLogsRes,
    ] = await Promise.all([
      supabase.from("shipments").select("status, estimated_cost"),
      supabase.from("deliveries").select("delivery_status"),
      supabase.from("customers").select("id"),
      supabase.from("drivers").select("availability_status, rating"),
      supabase.from("dispatchers").select("id, active_shipments"),
      supabase.from("vehicles").select("current_status"),
      supabase.from("routes").select("id"),
      supabase.from("fuel_logs").select("liters, cost"),
    ]);

    const errors = [
      shipmentsRes.error,
      deliveriesRes.error,
      customersRes.error,
      driversRes.error,
      dispatchersRes.error,
      vehiclesRes.error,
      routesRes.error,
      fuelLogsRes.error,
    ].filter(Boolean);

    if (errors.length) throw errors[0];

    const shipments = shipmentsRes.data ?? [];
    const deliveries = deliveriesRes.data ?? [];
    const customers = customersRes.data ?? [];
    const drivers = driversRes.data ?? [];
    const dispatchers = dispatchersRes.data ?? [];
    const vehicles = vehiclesRes.data ?? [];
    const routes = routesRes.data ?? [];
    const fuelLogs = fuelLogsRes.data ?? [];

    const dashboard = {
      statistics: {
        total_shipments: shipments.length,
        total_customers: customers.length,
        total_drivers: drivers.length,
        total_dispatchers: dispatchers.length,
        total_vehicles: vehicles.length,
        total_routes: routes.length,
        total_revenue: shipments.reduce(
          (sum, shipment) => sum + Number(shipment.estimated_cost ?? 0),
          0,
        ),

        active_deliveries: deliveries.filter(
          (delivery) => delivery.delivery_status === "in_transit",
        ).length,
      },

      shipment_analytics: {
        pending: shipments.filter((x) => x.status === "pending").length,
        assigned: shipments.filter((x) => x.status === "assigned").length,
        in_transit: shipments.filter((x) => x.status === "in_transit").length,
        delivered: shipments.filter((x) => x.status === "delivered").length,
        cancelled: shipments.filter((x) => x.status === "cancelled").length,
      },

      delivery_analytics: {
        today: deliveries.length,
        this_week: deliveries.length,
        this_month: deliveries.length,
        completed: deliveries.filter((x) => x.delivery_status === "completed")
          .length,
        failed: deliveries.filter((x) => x.delivery_status === "failed").length,
      },

      customer_analytics: {
        active_customers: customers.length,
        inactive_customers: 0,
        new_customers: customers.length,
        top_customer: null,
      },

      driver_analytics: {
        available: drivers.filter((x) => x.availability_status === "available")
          .length,
        busy: drivers.filter((x) => x.availability_status === "busy").length,
        offline: drivers.filter((x) => x.availability_status === "offline")
          .length,
        average_rating:
          drivers.length === 0
            ? 0
            : drivers.reduce(
                (sum, driver) => sum + Number(driver.rating ?? 0),
                0,
              ) / drivers.length,

        top_driver: null,
      },

      dispatcher_analytics: {
        active_dispatchers: dispatchers.length,

        total_assignments: dispatchers.reduce(
          (sum, dispatcher) => sum + Number(dispatcher.active_shipments ?? 0),
          0,
        ),
        pending_assignments: 0,
      },

      vehicle_analytics: {
        available: vehicles.filter((x) => x.current_status === "available")
          .length,
        assigned: vehicles.filter((x) => x.current_status === "assigned")
          .length,
        maintenance: vehicles.filter((x) => x.current_status === "maintenance")
          .length,
        inactive: vehicles.filter((x) => x.current_status === "inactive")
          .length,
      },

      fuel_analytics: {
        total_refuels: fuelLogs.length,

        total_liters: fuelLogs.reduce(
          (sum, log) => sum + Number(log.liters ?? 0),
          0,
        ),

        total_cost: fuelLogs.reduce(
          (sum, log) => sum + Number(log.cost ?? 0),
          0,
        ),

        average_cost_per_refuel:
          fuelLogs.length === 0
            ? 0
            : fuelLogs.reduce((sum, log) => sum + Number(log.cost ?? 0), 0) /
              fuelLogs.length,
      },

      route_analytics: {
        total_routes: routes.length,
        active_routes: routes.length,
        completed_routes: 0,
      },

      recent_activities: [],
    };

    return {
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
