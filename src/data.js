export const actions = ["View", "Create", "Edit", "Delete", "Approve", "Export"];

export const modules = [
  "Dashboard",
  "Customers",
  "Membership",
  "Savings",
  "RD",
  "Loan",
  "Chitty",
  "Reports",
];

export const emptyPermissions = () => ({
  Dashboard: [],
  Customers: [],
  Membership: [],
  Savings: [],
  RD: [],
  Loan: [],
  Chitty: [],
  Reports: [],
});

export function countPermissions(role) {
  if (!role || !role.permissions) return 0;
  return Object.values(role.permissions).reduce((total, items) => total + items.length, 0);
}
