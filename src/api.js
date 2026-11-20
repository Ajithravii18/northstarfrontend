import { modules } from "./data";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const scopeToApi = {
  "Assigned Branch": "ASSIGNED_BRANCH",
  "Selected Branches": "SELECTED_BRANCHES",
  "All Branches": "ALL_BRANCHES",
};

function moduleToApi(moduleName) {
  return moduleName.toUpperCase();
}

function encodeRole(role) {
  return {
    name: role.name,
    description: role.description,
    status: role.status.toUpperCase(),
    branchScope: scopeToApi[role.branchScope],
    branchIds: role.branchIds,
    approvalLevel: role.approvalLevel,
    approvalLimit: role.approvalLimit,
    permissions: Object.fromEntries(
      modules.map((moduleName) => [
        moduleToApi(moduleName),
        role.permissions[moduleName].map((action) => action.toUpperCase()),
      ]),
    ),
  };
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, "NETWORK_ERROR");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      typeof body?.message === "string" ? body.message : "The request could not be completed.",
      response.status,
      typeof body?.code === "string" ? body.code : "REQUEST_FAILED",
    );
  }
  if (!body?.success) {
    throw new ApiError("The server returned an invalid response.", response.status, "INVALID_RESPONSE");
  }
  return body;
}

export const api = {
  async authStatus() {
    return request("/auth/status");
  },
  async me() {
    const result = await request("/auth/me");
    return result.user;
  },
  async login(email, password) {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return result.user;
  },
  async setup(input) {
    const result = await request("/auth/setup", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.user;
  },
  async forgotPassword(email) {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(token, password, confirmPassword) {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },
  async logout() {
    await request("/auth/logout", { method: "POST" });
  },
  async roles() {
    const result = await request("/roles");
    return result.roles;
  },
  async branches() {
    const result = await request("/branches");
    return result.branches;
  },
  async users() {
    const result = await request("/users");
    return result.users;
  },
  async allUsers() {
    const result = await request("/users/all");
    return result.users;
  },
  async audit() {
    const result = await request("/audit");
    return result.events;
  },
  async createUser(input) {
    await request("/users", { method: "POST", body: JSON.stringify(input) });
  },
  async updateUserRole(userId, roleId) {
    const result = await request(`/users/${encodeURIComponent(userId)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    });
    return result.user;
  },
  async updateUserBranch(userId, branchId) {
    const result = await request(`/users/${encodeURIComponent(userId)}/branch`, {
      method: "PATCH",
      body: JSON.stringify({ branchId }),
    });
    return result.user;
  },
  async updateUserStatus(userId, isActive) {
    const result = await request(`/users/${encodeURIComponent(userId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return result.user;
  },
  async createRole(role) {
    await request("/roles", { method: "POST", body: JSON.stringify(encodeRole(role)) });
  },
  async updateRole(role) {
    await request(`/roles/${encodeURIComponent(role.id)}`, {
      method: "PUT",
      body: JSON.stringify(encodeRole(role)),
    });
  },
  async updateStatus(roleId, status) {
    await request(`/roles/${encodeURIComponent(roleId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: status.toUpperCase() }),
    });
  },
  async updatePermissions(roleId, permissions) {
    await request(`/roles/${encodeURIComponent(roleId)}/permissions`, {
      method: "PUT",
      body: JSON.stringify({
        permissions: Object.fromEntries(
          modules.map((moduleName) => [
            moduleToApi(moduleName),
            permissions[moduleName].map((action) => action.toUpperCase()),
          ]),
        ),
      }),
    });
  },
  async assignUsers(roleId, userIds) {
    await request(`/roles/${encodeURIComponent(roleId)}/users`, {
      method: "PUT",
      body: JSON.stringify({ userIds }),
    });
  },
  async cloneRole(roleId, name) {
    await request(`/roles/${encodeURIComponent(roleId)}/clone`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
};
