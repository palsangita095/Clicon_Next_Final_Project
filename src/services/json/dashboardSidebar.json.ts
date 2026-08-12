import {
  BellIcon,
  CircleCheckBigIcon,
  MapPinIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  UserStarIcon,
} from "@animateicons/react/lucide";
import {
  BarChart3,
  Bus,
  BusFront,
  Car,
  ClipboardList,
  Fuel,
  FuelIcon,
  LayoutDashboard,
  NotebookTabs,
  Package,
  Route,
  RouteIcon,
  Truck,
  User,
  UserCheck,
  VanIcon,
  Waypoints,
  WaypointsIcon,
} from "lucide-react";

export const SIDEBAR_ROLES_CONFIG = {
  // ! customer sidebar navigation
  customer: [
    { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Shipments", path: "/customer/shipments", icon: Package },
    { label: "Bookings", path: "/customer/bookings", icon: Waypoints },
    // { label: "Invoices", path: "/customer/invoices", icon: FileTextIcon },
    { label: "Estimate", path: "/customer/estimate", icon: RouteIcon },
    { label: "Tracking", path: "/customer/tracking", icon: MapPinIcon },
    { label: "Profile", path: "/customer/profile", icon: UserIcon },
  ],

  // ! driver sidebar navigation
  driver: [
    { label: "Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
    { label: "Deliveries", path: "/driver/deliveries", icon: Package },
    { label: "Map", path: "/driver/map", icon: Route },

    { label: "Vehicles", path: "/driver/vehicles", icon: Car },
    {
      label: "Vehicles Health",
      path: "/driver/vehicleshealth",
      icon: NotebookTabs,
    },
    { label: "Fuel Logs", path: "/driver/fuellogs", icon: FuelIcon },

    { label: "Profile", path: "/driver/profile", icon: User },
  ],

  // ! dispatcher sidebar navigation
  dispatcher: [
    {
      label: "Dashboard",
      path: "/dispatcher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Assignments",
      path: "/dispatcher/assignments",
      icon: ClipboardList,
    },
    { label: "Shipments", path: "/dispatcher/shipments", icon: Package },
    { label: "Vehicles", path: "/dispatcher/vehicle", icon: Car },
    { label: "Fleetmap", path: "/dispatcher/fleet-map", icon: MapPinIcon },
    { label: "Routes Create", path: "/dispatcher/routecreate", icon: Bus },
    {
      label: "Routes Assignments",
      path: "/dispatcher/routesassignments",
      icon: WaypointsIcon,
    },
    { label: "Reports", path: "/dispatcher/reports", icon: BarChart3 },
    { label: "Profile", path: "/dispatcher/profile", icon: UserIcon },
  ],

  // ! admin sidebar navigation
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Shipments", path: "/admin/shipments", icon: Package },
    {
      label: "Assign Deliveries",
      path: "/admin/assigndeliveries",
      icon: VanIcon,
    },
    { label: "Customers", path: "/admin/customers", icon: UserStarIcon },
    { label: "Dispatchers", path: "/admin/dispatchers", icon: UserCheck },
    { label: "Drivers", path: "/admin/drivers", icon: BusFront }, // driver documents
    { label: "Vehicles", path: "/admin/vehicles", icon: Truck }, // vehicels health
    { label: "Fuel Logs", path: "/admin/fuellogs", icon: Fuel },
    {
      label: "Roleverification",
      path: "/admin/roleverification",
      icon: CircleCheckBigIcon,
    },
    { label: "Routes", path: "/admin/routes", icon: Route },
    {
      label: "Routes Assignments",
      path: "/admin/routesassignments",
      icon: WaypointsIcon,
    },
    { label: "All Users", path: "/admin/allusers", icon: UsersIcon },
    { label: "Notifications", path: "/admin/notifications", icon: BellIcon },
    { label: "Settings", path: "/admin/settings", icon: SettingsIcon },
  ],
};
