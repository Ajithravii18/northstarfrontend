import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { api, ApiError } from "./api";
import {
  actions,
  countPermissions,
  emptyPermissions,
  modules,
} from "./data";
import {
  AccessDeniedPage,
  ForgotPasswordPage,
  LandingPage,
  LoadingPage,
  LoginPage,
  ResetPasswordPage,
  UserSessionPortal,
} from "./PublicPages";

const pageDetails = {
  roles: {
    eyebrow: "ACCESS MANAGEMENT",
    title: "Roles",
    description: "Create reusable role templates and control access across your organization.",
  },
  users: {
    eyebrow: "ACCESS MANAGEMENT",
    title: "Users",
    description: "Review mock users and assign active roles across branches.",
  },
  matrix: {
    eyebrow: "ACCESS MANAGEMENT",
    title: "Permission matrix",
    description: "Review and fine-tune the actions each role can perform in every module.",
  },
  approvals: {
    eyebrow: "GOVERNANCE",
    title: "Approval levels",
    description: "Set approval authority and financial limits for each role.",
  },
  audit: {
    eyebrow: "GOVERNANCE",
    title: "Audit log",
    description: "A clear record of changes made to roles, permissions, and access scope.",
  },
  reports: {
    eyebrow: "GOVERNANCE",
    title: "Reports",
    description: "Export role summaries, permission matrices, assignments, and inactive roles.",
  },
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(value),
  );

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatLimit = (value) =>
  value === null || value === undefined ? "No limit" : new Intl.NumberFormat("en").format(value);

function downloadCsv(filename, headings, rows) {
  const csv = [headings, ...rows]
    .map((line) =>
      line
        .map((value) => {
          const safeValue = /^[\t\r=+\-@]/.test(value) ? `'${value}` : value;
          return `"${safeValue.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Icon({
  name,
  size = 18,
  className,
}) {
  const paths = {
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    approval: (
      <>
        <path d="M12 3v18m0-18 6 3-6 3m0 6 6 3-6 3" />
        <path d="M5 6h7M5 18h7" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 2.7-6.4L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    plus: <path d="M12 5v14m-7-7h14" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5" />
        <path d="M5 17v3h14v-3" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4.3-.9L19 8.4 15.6 5 4.9 15.7 4 20Z" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
        <circle cx="10" cy="8" r="3.5" />
        <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M20 20v-1.5a3.5 3.5 0 0 0-2.8-3.4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </>
    ),
    filter: (
      <>
        <path d="M4 5h16M7 12h10m-7 7h4" />
      </>
    ),
    trend: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}

function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Dialog({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const focusable = dialogRef.current?.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, []);

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`dialog ${wide ? "dialog-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState({
    user: null,
    loading: true,
    setupRequired: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    api.me().then(
      (user) => {
        if (active) setSession({ user, loading: false, setupRequired: false, error: null });
      },
      async (error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          try {
            const status = await api.authStatus();
            if (active) {
              setSession({
                user: null,
                loading: false,
                setupRequired: status.setupRequired,
                error: null,
              });
            }
          } catch (statusError) {
            if (active) {
              setSession({
                user: null,
                loading: false,
                setupRequired: false,
                error: statusError instanceof Error ? statusError.message : "The server is unavailable.",
              });
            }
          }
          return;
        }
        setSession({
          user: null,
          loading: false,
          setupRequired: false,
          error: error instanceof Error ? error.message : "The server is unavailable.",
        });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const handleAuthenticated = (user) => {
    setSession({ user, loading: false, setupRequired: false, error: null });
    navigate("/app", { replace: true });
  };

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        setSession((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "Sign out could not be completed.",
        }));
      }
    } finally {
      setSession((current) => ({ ...current, user: null, loading: false }));
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (session.loading) return <LoadingPage />;
  if (session.user) {
    if (!session.user.isSystemAdministrator) return <UserSessionPortal user={session.user} onLogout={handleLogout} />;
    return <RoleDashboard user={session.user} onLogout={handleLogout} />;
  }
  if (location.pathname === "/forgot-password") {
    return <ForgotPasswordPage />;
  }
  if (location.pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }
  if (location.pathname === "/login" || location.pathname === "/app") {
    return (
      <LoginPage
        setupRequired={session.setupRequired}
        onAuthenticated={handleAuthenticated}
        serverError={session.error ?? undefined}
      />
    );
  }
  return (
    <LandingPage
      onLogin={() => navigate("/login")}
    />
  );
}

function RoleDashboard({ user, onLogout }) {
  const prefersReducedMotion = useReducedMotion();
  const [data, setData] = useState({ roles: [], audit: [] });
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [page, setPage] = useState("roles");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dialog, setDialog] = useState(null);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [matrixRoleId, setMatrixRoleId] = useState("");
  const [notice, setNotice] = useState(null);
  const [permissionSaving, setPermissionSaving] = useState(false);
  const permissionSaveInProgress = useRef(false);
  const deferredQuery = useDeferredValue(query);

  const reloadData = useCallback(async () => {
    const [roles, audit, nextUsers, nextAllUsers, nextBranches] = await Promise.all([
      api.roles(),
      api.audit(),
      api.users(),
      api.allUsers(),
      api.branches(),
    ]);
    setData({ roles, audit });
    setUsers(nextUsers);
    setAllUsers(nextAllUsers);
    setBranchOptions(nextBranches);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    void reloadData().catch((error) => {
      setDataLoading(false);
      reportRequestError(error, "Access data could not be loaded.");
    });
  }, [reloadData]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!matrixRoleId && data.roles.length) setMatrixRoleId(data.roles[0].id);
  }, [data.roles, matrixRoleId]);

  const roles = data.roles;
  const activeRoleCount = roles.filter((role) => role.status === "Active").length;
  const assignedUserCount = new Set(
    roles.filter((role) => role.status === "Active").flatMap((role) => role.userIds),
  ).size;
  const permissionCount = roles.reduce((total, role) => total + countPermissions(role), 0);
  const pageInfo = pageDetails[page] ?? pageDetails.roles;

  const filteredRoles = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const filtered = roles.filter((role) => {
      const matchesQuery =
        !normalizedQuery ||
        role.name.toLowerCase().includes(normalizedQuery) ||
        role.description.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "All statuses" || role.status === statusFilter;
      const matchesScope = scopeFilter === "All scopes" || role.branchScope === scopeFilter;
      return matchesQuery && matchesStatus && matchesScope;
    });
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.name.localeCompare(b.name);
      if (sortKey === "createdAt") comparison = a.createdAt.localeCompare(b.createdAt);
      if (sortKey === "users") comparison = a.userIds.length - b.userIds.length;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [deferredQuery, roles, scopeFilter, sortDirection, sortKey, statusFilter]);

  const selectedMatrixRole = roles.find((role) => role.id === matrixRoleId) ?? roles[0];

  const setNoticeMessage = (message, kind = "success") =>
    setNotice({ message, kind });

  const reportRequestError = (error, fallback) => {
    if (error instanceof ApiError && error.status === 401) {
      void onLogout();
      return;
    }
    setNoticeMessage(error instanceof Error ? error.message : fallback, "error");
  };

  const saveRole = async (role, editingId) => {
    const current = data.roles;
    const duplicate = current.some(
      (existing) =>
        existing.id !== editingId && existing.name.trim().toLowerCase() === role.name.trim().toLowerCase(),
    );
    if (duplicate) {
      setNoticeMessage("A role with this name already exists. Choose a unique role name.", "error");
      return false;
    }
    if (!role.name.trim()) {
      setNoticeMessage("Enter a role name before saving.", "error");
      return false;
    }
    if (countPermissions(role) === 0) {
      setNoticeMessage("Add at least one permission before saving this role.", "error");
      return false;
    }
    if (role.branchScope === "Selected Branches" && role.branchIds.length === 0) {
      setNoticeMessage("Choose at least one branch for this role.", "error");
      return false;
    }

    try {
      if (editingId) {
        await api.updateRole(role);
        setNoticeMessage(`${role.name} has been updated.`);
      } else {
        await api.createRole(role);
        setNoticeMessage(`${role.name} has been created.`);
      }
      await reloadData();
    } catch (error) {
      reportRequestError(error, "The role could not be saved.");
      return false;
    }
    setDialog(null);
    return true;
  };

  const changeStatus = async (role) => {
    const nextStatus = role.status === "Active" ? "Inactive" : "Active";
    try {
      await api.updateStatus(role.id, nextStatus);
      await reloadData();
      setNoticeMessage(`${role.name} is now ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      reportRequestError(error, "The role status could not be changed.");
    }
  };

  const changePermission = async (role, moduleName, action) => {
    if (permissionSaveInProgress.current) return;
    if (role.name === "System Administrator") {
      setNoticeMessage("System Administrator permissions are protected.", "error");
      return;
    }
    const currentlyEnabled = role.permissions[moduleName].includes(action);
    const permissions = {
      ...role.permissions,
      [moduleName]: currentlyEnabled
        ? role.permissions[moduleName].filter((item) => item !== action)
        : [...role.permissions[moduleName], action],
    };
    if (countPermissions({ ...role, permissions }) === 0) {
      setNoticeMessage("A role must keep at least one permission.", "error");
      return;
    }
    permissionSaveInProgress.current = true;
    setPermissionSaving(true);
    try {
      await api.updatePermissions(role.id, permissions);
      await reloadData();
      setNoticeMessage(`${action} permission ${currentlyEnabled ? "removed from" : "added to"} ${moduleName}.`);
    } catch (error) {
      reportRequestError(error, "Permission changes could not be saved.");
    } finally {
      permissionSaveInProgress.current = false;
      setPermissionSaving(false);
    }
  };

  const assignUsers = async (roleId, userIds) => {
    const role = roles.find((item) => item.id === roleId);
    if (!role) {
      setNoticeMessage("This role could not be found. Refresh and try again.", "error");
      return;
    }
    if (role.status !== "Active" && userIds.some((id) => !role.userIds.includes(id))) {
      setNoticeMessage("Inactive roles cannot be assigned to users.", "error");
      return;
    }
    try {
      await api.assignUsers(roleId, userIds);
      await reloadData();
      setDialog(null);
      setNoticeMessage(`Assignments for ${role.name} have been updated.`);
    } catch (error) {
      reportRequestError(error, "The role assignments could not be saved.");
    }
  };

  const createUser = async (input) => {
    try {
      await api.createUser(input);
    } catch (error) {
      reportRequestError(error, "The user could not be created.");
      return false;
    }
    setCreateUserOpen(false);
    setNoticeMessage(`${input.name.trim()} has been added.`);
    try {
      await reloadData();
    } catch (error) {
      reportRequestError(error, "The user was added, but the account list could not be refreshed.");
    }
    return true;
  };

  const handleUserRoleChange = async (userId, roleId) => {
    try {
      await api.updateUserRole(userId, roleId);
      const targetRole = roles.find((r) => r.id === roleId);
      setNotice({
        kind: "success",
        message: `Role updated to ${targetRole?.name ?? "selected role"}.`,
      });
      await reloadData();
    } catch (error) {
      reportRequestError(error, "Could not update user role.");
    }
  };

  const handleUserBranchChange = async (userId, branchId) => {
    try {
      await api.updateUserBranch(userId, branchId);
      const targetBranch = branchOptions.find((branch) => branch.id === branchId);
      setNoticeMessage(`Branch updated to ${targetBranch?.name ?? "selected branch"}.`);
      await reloadData();
    } catch (error) {
      reportRequestError(error, "Could not update user branch.");
    }
  };

  const exportRoles = () => {
    const headings = ["Role name", "Description", "Users assigned", "Status", "Branch scope", "Approval level", "Created date"];
    const lines = filteredRoles.map((role) => [
      role.name,
      role.description,
      String(role.userIds.length),
      role.status,
      role.branchScope,
      String(role.approvalLevel),
      formatDate(role.createdAt),
    ]);
    downloadCsv("northstar-roles.csv", headings, lines);
    setNoticeMessage(`${filteredRoles.length} roles exported to CSV.`);
  };

  const exportRoleSummary = () => {
    downloadCsv(
      "northstar-role-summary.csv",
      ["Role name", "Description", "Users assigned", "Status", "Branch scope", "Approval level", "Approval limit", "Created date"],
      roles.map((role) => [
        role.name,
        role.description,
        String(role.userIds.length),
        role.status,
        role.branchScope,
        String(role.approvalLevel),
        role.approvalLimit === null || role.approvalLimit === undefined ? "" : String(role.approvalLimit),
        formatDate(role.createdAt),
      ]),
    );
    setNoticeMessage("Role summary exported to CSV.");
  };

  const exportPermissionMatrix = () => {
    downloadCsv(
      "northstar-permission-matrix.csv",
      ["Role", "Status", "Module", ...actions],
      roles.flatMap((role) =>
        modules.map((moduleName) => [
          role.name,
          role.status,
          moduleName,
          ...actions.map((action) => role.permissions[moduleName].includes(action) ? "Yes" : "No"),
        ]),
      ),
    );
    setNoticeMessage("Permission matrix exported to CSV.");
  };

  const exportRoleAssignments = () => {
    downloadCsv(
      "northstar-role-assignments.csv",
      ["Name", "Email", "Role", "Branch", "Status"],
      allUsers.map((user) => [
        user.name,
        user.email,
        user.roleName,
        user.branch,
        user.isActive ? "Active" : "Inactive",
      ]),
    );
    setNoticeMessage("Role assignment report exported to CSV.");
  };

  const exportInactiveRoles = () => {
    const inactiveRoles = roles.filter((role) => role.status === "Inactive");
    downloadCsv(
      "northstar-inactive-roles.csv",
      ["Role name", "Description", "Users assigned", "Branch scope", "Approval level", "Created date"],
      inactiveRoles.map((role) => [
        role.name,
        role.description,
        String(role.userIds.length),
        role.branchScope,
        String(role.approvalLevel),
        formatDate(role.createdAt),
      ]),
    );
    setNoticeMessage(`${inactiveRoles.length} inactive roles exported to CSV.`);
  };

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  };

  const goToPage = (nextPage) => setPage(nextPage);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => goToPage("roles")} aria-label="Northstar ERP home">
          <span className="brand-mark"><Icon name="shield" size={22} /></span>
          <span className="brand-name">northstar<span>ERP</span></span>
        </button>
        <nav className="side-nav" aria-label="Access control navigation">
          <div className="nav-section-label">ACCESS CONTROL</div>
          <button className={`nav-item ${page === "roles" ? "nav-item-active" : ""}`} aria-label="Roles" onClick={() => goToPage("roles")}>
            <Icon name="users" /><span>Roles</span><span className="nav-count">{roles.length}</span>
          </button>
          <button className={`nav-item ${page === "users" ? "nav-item-active" : ""}`} aria-label="Users" onClick={() => goToPage("users")}>
            <Icon name="users" /><span>Users</span><span className="nav-count">{allUsers.length}</span>
          </button>
          <button className={`nav-item ${page === "matrix" ? "nav-item-active" : ""}`} aria-label="Permission matrix" onClick={() => goToPage("matrix")}>
            <Icon name="grid" /><span>Permission matrix</span>
          </button>
          <button className={`nav-item ${page === "approvals" ? "nav-item-active" : ""}`} aria-label="Approval levels" onClick={() => goToPage("approvals")}>
            <Icon name="approval" /><span>Approval levels</span>
          </button>
          <div className="nav-section-label nav-section-spaced">GOVERNANCE</div>
          <button className={`nav-item ${page === "audit" ? "nav-item-active" : ""}`} aria-label="Audit log" onClick={() => goToPage("audit")}>
            <Icon name="history" /><span>Audit log</span>
          </button>
          <button className={`nav-item ${page === "reports" ? "nav-item-active" : ""}`} aria-label="Reports" onClick={() => goToPage("reports")}>
            <Icon name="download" /><span>Reports</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar avatar-indigo">{initials(user.name)}</span>
            <span className="profile-text"><strong>{user.name}</strong><small>{user.roleName}</small></span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span>Settings</span><span className="breadcrumb-divider">/</span><strong>Access control</strong></div>
          <div className="topbar-right">
            <div className="topbar-user">
              <span className="avatar avatar-indigo">{initials(user.name)}</span><span>{user.name}</span>
            </div>
            <Button className="sign-out-button" onClick={onLogout}>Sign out</Button>
          </div>
        </header>
        <motion.main
          key={page}
          className="main-content"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 0.68, 0, 1] }}
        >
          <div className="page-heading">
            <div>
              <div className="eyebrow">{pageInfo.eyebrow}</div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.description}</p>
            </div>
            {page === "roles" && (
              <div className="heading-actions">
                <Button onClick={exportRoles}><Icon name="download" size={16} /> Export</Button>
                <Button variant="primary" onClick={() => setDialog({ type: "form" })}>
                  <Icon name="plus" size={17} /> Create role
                </Button>
              </div>
            )}
            {page === "users" && (
              <div className="heading-actions">
                <Button
                  variant="primary"
                  onClick={() => setCreateUserOpen(true)}
                  disabled={!roles.some((role) => role.status === "Active" && role.name !== "System Administrator") || branchOptions.length === 0}
                >
                  <Icon name="plus" size={17} /> Add user
                </Button>
              </div>
            )}
          </div>

          {dataLoading ? (
            <div className="panel data-loading"><LoadingPage message="Loading roles and permissions..." /></div>
          ) : (
          <>
          {page === "roles" && (
            <>
              <section className="stats-grid" aria-label="Role summary">
                <StatCard label="Total roles" value={roles.length} note="Across all modules" icon="users" tint="blue" />
                <StatCard label="Active roles" value={activeRoleCount} note={`${roles.length - activeRoleCount} inactive`} icon="shield" tint="green" />
                <StatCard label="Assigned users" value={assignedUserCount} note="Across all active roles" icon="users" tint="violet" />
                <StatCard label="Permissions granted" value={permissionCount} note="Module action grants" icon="grid" tint="amber" />
              </section>
              <section className="panel roles-panel">
                <div className="panel-heading">
                  <div>
                    <h2>All roles <span className="heading-count">{filteredRoles.length}</span></h2>
                    <p>Manage access templates and their assigned users.</p>
                  </div>
                  <button className="text-button" type="button" onClick={() => goToPage("matrix")}>
                    View permission matrix <Icon name="arrow" size={15} />
                  </button>
                </div>
                <div className="table-toolbar">
                  <label className="search-field">
                    <Icon name="search" size={17} />
                    <input
                      type="search"
                      aria-label="Search roles"
                      placeholder="Search roles..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><Icon name="close" size={15} /></button>}
                  </label>
                  <div className="toolbar-filters">
                    <label className="select-wrap">
                      <Icon name="filter" size={15} />
                      <span className="select-value">{statusFilter}</span>
                      <Icon name="chevron" size={14} />
                      <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option>All statuses</option><option>Active</option><option>Inactive</option>
                      </select>
                    </label>
                    <label className="select-wrap scope-filter">
                      <span className="select-value">{scopeFilter}</span>
                      <Icon name="chevron" size={14} />
                      <select aria-label="Filter by branch scope" value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}>
                        <option>All scopes</option><option>Assigned Branch</option><option>Selected Branches</option><option>All Branches</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="roles-table">
                    <thead>
                      <tr>
                        <th><button className="sort-button" onClick={() => toggleSort("name")}>ROLE NAME <SortMark active={sortKey === "name"} direction={sortDirection} /></button></th>
                        <th>BRANCH SCOPE</th>
                        <th><button className="sort-button" onClick={() => toggleSort("users")}>USERS <SortMark active={sortKey === "users"} direction={sortDirection} /></button></th>
                        <th>APPROVAL</th>
                        <th>STATUS</th>
                        <th><button className="sort-button" onClick={() => toggleSort("createdAt")}>CREATED <SortMark active={sortKey === "createdAt"} direction={sortDirection} /></button></th>
                        <th><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.map((role) => (
                        <RoleRow
                          key={role.id}
                          role={role}
                          users={users}
                          onView={() => setDialog({ type: "details", roleId: role.id })}
                          onEdit={() => setDialog({ type: "form", role })}
                          onClone={() => setDialog({ type: "form", role, clone: true })}
                          onUsers={() => setDialog({ type: "users", roleId: role.id })}
                          onToggle={() => changeStatus(role)}
                        />
                      ))}
                    </tbody>
                  </table>
                  {filteredRoles.length === 0 && (
                    <div className="empty-state"><span className="empty-icon"><Icon name="search" size={21} /></span><strong>No roles found</strong><p>Try adjusting your search or filters.</p><Button onClick={() => { setQuery(""); setStatusFilter("All statuses"); setScopeFilter("All scopes"); }}>Clear filters</Button></div>
                  )}
                </div>
                <div className="table-footer">
                  <span>Showing <strong>{filteredRoles.length ? 1 : 0}–{filteredRoles.length}</strong> of <strong>{roles.length}</strong> roles</span>
                  <span className="table-footer-note"><Icon name="lock" size={13} /> Role changes are recorded in the audit log</span>
                </div>
              </section>
              <div className="page-footnote"><Icon name="shield" size={15} /><span>Access follows the principle of least privilege. Review role permissions regularly.</span><button type="button" onClick={() => goToPage("matrix")}>Review permissions <Icon name="arrow" size={14} /></button></div>
            </>
          )}

          {page === "users" && (
            <UsersPage
              users={allUsers}
              roles={roles}
              branches={branchOptions}
              onRoleChange={handleUserRoleChange}
              onBranchChange={handleUserBranchChange}
            />
          )}

          {page === "matrix" && (
            <PermissionMatrix
              roles={roles}
              selectedRole={selectedMatrixRole}
              saving={permissionSaving}
              onSelect={(id) => setMatrixRoleId(id)}
              onToggle={changePermission}
              onEdit={() => selectedMatrixRole && setDialog({ type: "form", role: selectedMatrixRole })}
            />
          )}

          {page === "reports" && (
            <ReportsPage
              onRoleSummary={exportRoleSummary}
              onPermissionMatrix={exportPermissionMatrix}
              onRoleAssignments={exportRoleAssignments}
              onInactiveRoles={exportInactiveRoles}
            />
          )}
          {page === "approvals" && <ApprovalsPage roles={roles} />}
          {page === "audit" && <AuditPage events={data.audit} />}
          </>
          )}
        </motion.main>
      </div>

      {dialog?.type === "form" && (
        <RoleFormDialog
          key={`${dialog.role?.id ?? "new"}-${dialog.clone ? "clone" : "edit"}`}
          role={dialog.role}
          clone={dialog.clone ?? false}
          allRoles={roles}
          branchOptions={branchOptions}
          onClose={() => setDialog(null)}
          onSave={saveRole}
        />
      )}
      {dialog?.type === "details" && (
        <RoleDetailsDialog
          role={roles.find((role) => role.id === dialog.roleId)}
          users={users}
          branches={branchOptions}
          onClose={() => setDialog(null)}
          onEdit={(role) => setDialog({ type: "form", role })}
          onClone={(role) => setDialog({ type: "form", role, clone: true })}
          onUsers={(role) => setDialog({ type: "users", roleId: role.id })}
          onMatrix={(role) => {
            setMatrixRoleId(role.id);
            setPage("matrix");
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === "users" && (
        <AssignUsersDialog
          role={roles.find((role) => role.id === dialog.roleId)}
          users={users}
          onClose={() => setDialog(null)}
          onSave={assignUsers}
        />
      )}
      {createUserOpen && (
        <CreateUserDialog
          roles={roles.filter((role) => role.status === "Active" && role.name !== "System Administrator")}
          branches={branchOptions}
          onClose={() => setCreateUserOpen(false)}
          onSave={createUser}
        />
      )}
      {notice && <div className={`toast toast-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}><span className="toast-indicator"><Icon name={notice.kind === "error" ? "close" : "check"} size={14} /></span>{notice.message}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
  tint,
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-${tint}`}><Icon name={icon} size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value.toLocaleString("en")}</div>
      <div className="stat-note">{note}</div>
      <span className="stat-trend"><Icon name="trend" size={14} /></span>
    </article>
  );
}

function SortMark({ active, direction }) {
  return <span className={`sort-mark ${active ? "sort-mark-active" : ""}`}>{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span>;
}

function RoleRow({
  role,
  users,
  onView,
  onEdit,
  onClone,
  onUsers,
  onToggle,
}) {
  const isProtected = role.name === "System Administrator";
  return (
    <tr>
      <td>
        <button className="role-name-button" type="button" onClick={onView}>
          <span className={`role-symbol ${isProtected ? "role-symbol-admin" : ""}`}><Icon name={isProtected ? "shield" : "users"} size={17} /></span>
          <span className="role-name-text"><strong>{role.name}</strong><small>{role.description}</small></span>
          {isProtected && <span className="protected-tag"><Icon name="lock" size={11} /> Protected</span>}
        </button>
      </td>
      <td><ScopeTag scope={role.branchScope} /></td>
      <td>
        <button className="user-count-button" type="button" onClick={onUsers} aria-label={`${role.userIds.length} users assigned to ${role.name}`}>
          <span className="mini-avatars">
            {role.userIds.slice(0, 3).map((id, index) => {
              const user = users.find((item) => item.id === id);
              return user ? <span key={id} className={`mini-avatar mini-avatar-${index}`}>{initials(user.name)}</span> : null;
            })}
          </span>
          <strong>{role.userIds.length}</strong>
        </button>
      </td>
      <td><span className="approval-cell"><span className="approval-level">L{role.approvalLevel}</span><span>{formatLimit(role.approvalLimit)}</span></span></td>
      <td><StatusTag status={role.status} /></td>
      <td className="created-cell">{formatDate(role.createdAt)}</td>
      <td>
        <div className="row-actions">
          <button className="icon-button" type="button" aria-label={`View ${role.name}`} title="View details" onClick={onView}><Icon name="eye" size={16} /></button>
          <button className="icon-button" type="button" aria-label={`Edit ${role.name}`} title="Edit role" onClick={onEdit}><Icon name="edit" size={16} /></button>
          <button className="icon-button" type="button" aria-label={`Clone ${role.name}`} title="Clone role" onClick={onClone}><Icon name="copy" size={16} /></button>
          <button className={`status-action ${role.status === "Active" ? "status-action-off" : "status-action-on"}`} type="button" aria-label={`${role.status === "Active" ? "Deactivate" : "Activate"} ${role.name}`} title={`${role.status === "Active" ? "Deactivate" : "Activate"} role`} onClick={onToggle} disabled={isProtected}>
            {role.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusTag({ status }) {
  return <span className={`status-tag ${status === "Active" ? "status-active" : "status-inactive"}`}><span />{status}</span>;
}

function ScopeTag({ scope }) {
  return <span className="scope-tag">{scope === "All Branches" ? <Icon name="grid" size={13} /> : <Icon name="users" size={13} />}{scope}</span>;
}

function PermissionMatrix({
  roles,
  selectedRole,
  saving,
  onSelect,
  onToggle,
  onEdit,
}) {
  return (
    <>
      <section className="matrix-controls panel">
        <div className="matrix-role-select">
          <span className="matrix-role-icon"><Icon name="shield" size={18} /></span>
          <label htmlFor="matrix-role">Role to configure</label>
          <select id="matrix-role" value={selectedRole?.id ?? ""} onChange={(event) => onSelect(event.target.value)} disabled={saving}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
          {selectedRole && <StatusTag status={selectedRole.status} />}
        </div>
        <Button onClick={onEdit} disabled={saving}><Icon name="edit" size={15} /> Edit role details</Button>
      </section>
      {selectedRole ? (
        <>
          <section className="matrix-summary">
            <div><span className="summary-label">MODULES</span><strong>{modules.filter((moduleName) => selectedRole.permissions[moduleName].length > 0).length}<small> / {modules.length} enabled</small></strong></div>
            <div><span className="summary-label">PERMISSIONS</span><strong>{countPermissions(selectedRole)}<small> granted actions</small></strong></div>
            <div><span className="summary-label">BRANCH SCOPE</span><strong className="summary-text">{selectedRole.branchScope}</strong></div>
            <div><span className="summary-label">ASSIGNED USERS</span><strong>{selectedRole.userIds.length}<small> users</small></strong></div>
          </section>
          <section className="panel matrix-panel">
            <div className="panel-heading matrix-panel-heading"><div><h2>{selectedRole.name} <span className="heading-count">{countPermissions(selectedRole)} permissions</span></h2><p>Select the actions this role is allowed to perform.</p></div><div className="matrix-key"><span className="matrix-key-active"><Icon name="check" size={12} /> Enabled</span><span><span className="matrix-key-disabled" /> Not granted</span></div></div>
            <div className="table-scroll">
              <table className="permission-table">
                <thead><tr><th>MODULE</th>{actions.map((action) => <th key={action}>{action.toUpperCase()}</th>)}<th>MODULE ACCESS</th></tr></thead>
                <tbody>
                  {modules.map((moduleName) => {
                    const enabledCount = selectedRole.permissions[moduleName].length;
                    return (
                      <tr key={moduleName}>
                        <td><span className="module-icon"><Icon name={moduleName === "Dashboard" ? "grid" : moduleName === "Reports" ? "history" : "users"} size={16} /></span><strong>{moduleName}</strong></td>
                        {actions.map((action) => {
                          const checked = selectedRole.permissions[moduleName].includes(action);
                          return <td key={action} className="permission-cell"><label className="permission-checkbox"><input type="checkbox" checked={checked} disabled={saving || selectedRole.name === "System Administrator"} onChange={() => onToggle(selectedRole, moduleName, action)} aria-label={`${checked ? "Remove" : "Grant"} ${action} permission for ${moduleName}`} /><span><Icon name="check" size={12} /></span></label></td>;
                        })}
                        <td><span className={`module-access ${enabledCount ? "module-access-on" : ""}`}>{enabledCount ? `${enabledCount} actions` : "No access"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="matrix-footer"><span><Icon name="lock" size={14} /> Permission changes are saved automatically and recorded in the audit log.</span><span>Changes apply to new sessions.</span></div>
          </section>
        </>
      ) : (
        <div className="panel empty-state"><strong>No roles available</strong><p>Create a role to configure permissions.</p></div>
      )}
    </>
  );
}

function ApprovalsPage({ roles }) {
  const approvalRoles = [...roles].sort((a, b) => b.approvalLevel - a.approvalLevel || a.name.localeCompare(b.name));
  const maxLevel = Math.max(1, ...roles.map((role) => role.approvalLevel));
  return (
    <>
      <section className="approval-hero">
        <div className="approval-hero-copy"><span className="approval-hero-icon"><Icon name="approval" size={20} /></span><div><span className="eyebrow">APPROVAL WORKFLOW</span><h2>Clear authority at every level</h2><p>Roles with higher approval levels can authorize larger financial decisions.</p></div></div>
        <div className="approval-ladder" aria-label={`Approval levels 0 through ${maxLevel}`}>
          {Array.from({ length: maxLevel + 1 }, (_, index) => maxLevel - index).map((level, index) => (
            <div key={level} className={`ladder-step ${index === 0 ? "ladder-step-current" : ""}`}><span className="ladder-level">LEVEL {level}</span><strong>{roles.filter((role) => role.approvalLevel === level).length} roles</strong></div>
          ))}
        </div>
      </section>
      <section className="panel approval-panel">
        <div className="panel-heading"><div><h2>Role approval settings</h2><p>Approval limit is optional. “No limit” means the role has no configured ceiling.</p></div><span className="approval-count">{roles.filter((role) => role.approvalLevel > 0).length} roles with authority</span></div>
        <div className="table-scroll"><table className="standard-table"><thead><tr><th>ROLE</th><th>APPROVAL LEVEL</th><th>APPROVAL LIMIT</th><th>BRANCH SCOPE</th><th>STATUS</th></tr></thead><tbody>
          {approvalRoles.map((role) => <tr key={role.id}><td><span className="role-table-name"><span className="role-symbol"><Icon name={role.name === "System Administrator" ? "shield" : "users"} size={16} /></span><span><strong>{role.name}</strong><small>{role.userIds.length} assigned users</small></span></span></td><td><span className={`level-pill ${role.approvalLevel ? "" : "level-pill-muted"}`}>Level {role.approvalLevel}</span></td><td className="limit-value">{formatLimit(role.approvalLimit)}</td><td><ScopeTag scope={role.branchScope} /></td><td><StatusTag status={role.status} /></td></tr>)}
        </tbody></table></div>
      </section>
      <div className="page-footnote"><Icon name="approval" size={15} /><span>Approval levels are configured in each role. These settings support future workflow approvals.</span></div>
    </>
  );
}

function AuditPage({ events }) {
  return (
    <>
      <section className="audit-summary panel">
        <div className="audit-summary-icon"><Icon name="history" size={21} /></div>
        <div><strong>{events.length} recorded events</strong><p>Role, permission, branch scope, approval, and assignment changes are tracked here.</p></div>
        <span className="audit-live"><span /> Audit trail active</span>
      </section>
      <section className="panel audit-panel">
        <div className="panel-heading"><div><h2>Recent activity</h2><p>Most recent changes to access control settings.</p></div><span className="audit-retention"><Icon name="lock" size={13} /> Role changes are captured for review</span></div>
        {events.length ? (
          <div className="audit-list">
            {events.map((event, index) => (
              <div className="audit-row" key={event.id}>
                <span className={`audit-event-icon audit-event-${index % 4}`}><Icon name={event.action.toLowerCase().includes("permission") ? "grid" : event.action.toLowerCase().includes("approval") ? "approval" : event.action.toLowerCase().includes("scope") ? "filter" : "users"} size={16} /></span>
                <span className="audit-event-copy"><strong>{event.action}</strong><small><b>{event.target}</b> · {event.actor}</small></span>
                <time dateTime={event.timestamp}>{formatDateTime(event.timestamp)}</time>
              </div>
            ))}
          </div>
        ) : <div className="empty-state"><span className="empty-icon"><Icon name="history" /></span><strong>No activity recorded yet</strong><p>New role and permission changes will appear here.</p></div>}
        <div className="audit-footer"><Icon name="shield" size={15} /><span>Audit records are stored on the server and available to authorized administrators.</span></div>
      </section>
    </>
  );
}

function RoleFormDialog({
  role,
  clone,
  allRoles,
  branchOptions,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(role) && !clone;
  const isProtected = role?.name === "System Administrator" && !clone;
  const [name, setName] = useState(clone && role ? `${role.name} copy` : role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [status, setStatus] = useState(role?.status ?? "Active");
  const [branchScope, setBranchScope] = useState(role?.branchScope ?? "Assigned Branch");
  const [branchIds, setBranchIds] = useState(role?.branchIds ?? []);
  const [approvalLevel, setApprovalLevel] = useState(role?.approvalLevel ?? 0);
  const [approvalLimit, setApprovalLimit] = useState(
    role?.approvalLimit === null || role?.approvalLimit === undefined ? "" : String(role.approvalLimit),
  );
  const [permissions, setPermissions] = useState(() =>
    role ? structuredClone(role.permissions) : emptyPermissions(),
  );
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePermission = (moduleName, action) => {
    setPermissions((current) => ({
      ...current,
      [moduleName]: current[moduleName].includes(action)
        ? current[moduleName].filter((item) => item !== action)
        : [...current[moduleName], action],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const trimmedName = name.trim();
    if (!trimmedName) return setFormError("Role name is required.");
    if (trimmedName.length > 100) return setFormError("Role name must be 100 characters or fewer.");
    if (description.length > 500) return setFormError("Description must be 500 characters or fewer.");
    if (
      allRoles.some(
        (existing) =>
          existing.id !== (isEditing ? role?.id : null) &&
          existing.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      return setFormError("A role with this name already exists.");
    }
    if (Object.values(permissions).every((granted) => granted.length === 0)) {
      return setFormError("Select at least one permission.");
    }
    if (branchScope === "Selected Branches" && branchIds.length === 0) {
      return setFormError("Select at least one branch for this scope.");
    }
    const numericLimit = approvalLimit.trim() === "" ? null : Number(approvalLimit);
    if (numericLimit !== null && (!Number.isFinite(numericLimit) || numericLimit < 0)) {
      return setFormError("Approval limit must be zero or a positive amount.");
    }
    if (!Number.isInteger(approvalLevel) || approvalLevel < 0) {
      return setFormError("Approval level must be a whole number greater than or equal to zero.");
    }
    setSaving(true);
    try {
      const saved = await onSave(
        {
          id: isEditing && role ? role.id : crypto.randomUUID(),
          name: isProtected ? "System Administrator" : trimmedName,
          description: description.trim(),
          status,
          branchScope,
          branchIds: branchScope === "Selected Branches" ? branchIds : [],
          approvalLevel,
          approvalLimit: numericLimit,
          permissions,
          userIds: isEditing && role ? role.userIds : [],
          createdAt: role?.createdAt ?? new Date().toISOString(),
        },
        isEditing && role ? role.id : null,
      );
      if (!saved) setFormError("The role could not be saved. Review the error message and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={clone ? "Clone role" : isEditing ? "Edit role" : "Create role"}
      subtitle={clone ? "Create a new role using an existing role as a starting point." : "Define role details, permissions, scope, and approval authority."}
      onClose={onClose}
      wide
    >
      <form className="role-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section-heading"><span className="form-section-number">01</span><div><h3>General information</h3><p>Give this role a clear, reusable definition.</p></div></div>
          <div className="form-grid">
            <label className="field field-full"><span>Role name <i>*</i></span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required readOnly={isProtected} placeholder="e.g. Branch Manager" /><small>{name.length}/100 characters</small></label>
            <label className="field field-full"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={2} placeholder="Describe this role's responsibilities and access needs." /><small>{description.length}/500 characters</small></label>
          </div>
        </div>
        <div className="form-section">
          <div className="form-section-heading"><span className="form-section-number">02</span><div><h3>Module permissions</h3><p>Choose the actions this role can perform in each module.</p></div><span className="permissions-selected">{Object.values(permissions).reduce((total, value) => total + value.length, 0)} selected</span></div>
          <div className="form-matrix-wrap">
            <table className="form-matrix">
              <thead><tr><th>MODULE</th>{actions.map((action) => <th key={action}>{action.slice(0, 3).toUpperCase()}</th>)}</tr></thead>
              <tbody>{modules.map((moduleName) => <tr key={moduleName}><td>{moduleName}</td>{actions.map((action) => <td key={action}><label className="permission-checkbox"><input type="checkbox" checked={permissions[moduleName].includes(action)} disabled={isProtected} onChange={() => togglePermission(moduleName, action)} aria-label={`${action} ${moduleName}`} /><span><Icon name="check" size={12} /></span></label></td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="form-section">
          <div className="form-section-heading"><span className="form-section-number">03</span><div><h3>Branch scope & approvals</h3><p>Limit data access and define financial approval authority.</p></div></div>
          <div className="form-grid">
            <label className="field"><span>Branch scope <i>*</i></span><select value={branchScope} onChange={(event) => setBranchScope(event.target.value)} disabled={isProtected}><option>Assigned Branch</option><option>Selected Branches</option><option>All Branches</option></select></label>
            <label className="field"><span>Approval level</span><input type="number" min="0" step="1" value={approvalLevel} onChange={(event) => setApprovalLevel(Number(event.target.value))} /></label>
            {branchScope === "Selected Branches" && (
              <fieldset className="branch-picker field-full"><legend>Available branches <i>*</i></legend>{branchOptions.map((branch) => <label key={branch.id}><input type="checkbox" checked={branchIds.includes(branch.id)} onChange={() => setBranchIds((ids) => ids.includes(branch.id) ? ids.filter((id) => id !== branch.id) : [...ids, branch.id])} /><span>{branch.name}</span></label>)}</fieldset>
            )}
            <label className="field"><span>Approval limit <small>(optional)</small></span><input type="number" min="0" step="1000" value={approvalLimit} onChange={(event) => setApprovalLimit(event.target.value)} placeholder="No limit" /><small>Maximum amount this role can approve.</small></label>
            <label className="field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)} disabled={isProtected}><option>Active</option><option>Inactive</option></select></label>
          </div>
          {isProtected && <div className="protected-notice"><Icon name="lock" size={15} /> The System Administrator role is protected and must remain active.</div>}
        </div>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="form-footer"><span><i>*</i> Required fields · Changes are recorded in the audit log</span><div><Button type="button" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : clone ? "Create cloned role" : isEditing ? "Save changes" : "Create role"}</Button></div></div>
      </form>
    </Dialog>
  );
}

function RoleDetailsDialog({
  role,
  users,
  branches,
  onClose,
  onEdit,
  onClone,
  onUsers,
  onMatrix,
}) {
  if (!role) return null;
  const enabledModules = modules.filter((moduleName) => role.permissions[moduleName].length > 0);
  const assignedUsers = role.userIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user) => user !== undefined);
  return (
    <Dialog title="Role details" subtitle="Review role access, assignments, and approval authority." onClose={onClose} wide>
      <div className="details-content">
        <div className="details-hero"><span className={`role-symbol details-role-icon ${role.name === "System Administrator" ? "role-symbol-admin" : ""}`}><Icon name={role.name === "System Administrator" ? "shield" : "users"} size={21} /></span><div className="details-title"><div><h3>{role.name}</h3>{role.name === "System Administrator" && <span className="protected-tag"><Icon name="lock" size={11} /> Protected</span>}</div><p>{role.description || "No description provided."}</p></div><StatusTag status={role.status} /></div>
        <div className="details-metrics"><div><span>Permissions</span><strong>{countPermissions(role)}</strong></div><div><span>Modules</span><strong>{enabledModules.length}<small> / {modules.length}</small></strong></div><div><span>Approval level</span><strong>L{role.approvalLevel}</strong></div><div><span>Approval limit</span><strong>{formatLimit(role.approvalLimit)}</strong></div></div>
        <div className="details-grid">
          <section className="details-section"><div className="details-section-heading"><h4>Module permissions</h4><button type="button" className="text-button" onClick={() => onMatrix(role)}>Open matrix <Icon name="arrow" size={13} /></button></div><div className="permission-chip-list">{enabledModules.map((moduleName) => <div className="permission-chip-row" key={moduleName}><strong>{moduleName}</strong><span>{role.permissions[moduleName].join(" · ")}</span></div>)}</div></section>
          <section className="details-section"><div className="details-section-heading"><h4>Branch access</h4></div><div className="detail-scope"><ScopeTag scope={role.branchScope} />{role.branchScope === "Selected Branches" && <p>{role.branchIds.map((id) => branches.find((branch) => branch.id === id)?.name).filter(Boolean).join(", ") || "No branches selected"}</p>}</div><div className="details-section-heading assigned-heading"><h4>Assigned users <span className="heading-count">{assignedUsers.length}</span></h4><button type="button" className="text-button" onClick={() => onUsers(role)}>Manage <Icon name="arrow" size={13} /></button></div><div className="assigned-user-list">{assignedUsers.length ? assignedUsers.map((user) => <div key={user.id} className="assigned-user"><span className="avatar avatar-light">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email} · {user.branch}</small></span></div>) : <p className="no-assigned-users">No users assigned to this role.</p>}</div></section>
        </div>
        <div className="details-bottom"><span>Created {formatDate(role.createdAt)}</span><div><Button onClick={() => onClone(role)}><Icon name="copy" size={15} /> Clone role</Button><Button variant="primary" onClick={() => onEdit(role)}><Icon name="edit" size={15} /> Edit role</Button></div></div>
      </div>
    </Dialog>
  );
}

function AssignUsersDialog({
  role,
  users,
  onClose,
  onSave,
}) {
  const [selectedIds, setSelectedIds] = useState(role?.userIds ?? []);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  if (!role) return null;
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.branch}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const isDisabled = role.status !== "Active";
  return (
    <Dialog title="Assign users" subtitle={`Choose who inherits the ${role.name} role.`} onClose={onClose}>
      <div className="assign-content">
        {isDisabled && <div className="form-warning"><Icon name="lock" size={15} /> This role is inactive. Activate it before assigning additional users.</div>}
        <label className="search-field assign-search"><Icon name="search" size={16} /><input type="search" placeholder="Search people..." aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="assign-list">
          {filteredUsers.map((user) => {
            const checked = selectedIds.includes(user.id);
            return (
              <label className={`assign-user ${checked ? "assign-user-selected" : ""}`} key={user.id}>
                <span className="assign-checkbox">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isDisabled && !checked}
                    onChange={() => setSelectedIds((ids) => checked ? ids.filter((id) => id !== user.id) : [...ids, user.id])}
                    aria-label={`Select ${user.name}`}
                  />
                  <span className="assign-check" aria-hidden="true">
                    <Icon name="check" size={12} />
                  </span>
                </span>
                <span className="avatar avatar-light">{initials(user.name)}</span>
                <span className="assign-user-copy">
                  <strong>{user.name}</strong>
                  <small>
                    {user.email}
                    <span>{user.branch}</span>
                  </small>
                </span>
              </label>
            );
          })}
          {!filteredUsers.length && <div className="assign-empty">No users match that search.</div>}
        </div>
        <div className="assign-footer"><span><strong>{selectedIds.length}</strong> users selected</span><div><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" onClick={async () => { setSaving(true); try { await onSave(role.id, selectedIds); } finally { setSaving(false); } }} disabled={saving || (isDisabled && selectedIds.some((id) => !role.userIds.includes(id)))}>{saving ? "Saving..." : "Save assignments"}</Button></div></div>
      </div>
    </Dialog>
  );
}

function UsersPage({
  users,
  roles,
  branches = [],
  onRoleChange,
  onBranchChange,
}) {
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All branches");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const activeRoles = roles.filter((role) => role.status === "Active");

  const branchList = useMemo(() => {
    if (branches && branches.length) return branches.map((b) => b.name);
    return Array.from(new Set(users.map((u) => u.branch).filter(Boolean)));
  }, [branches, users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesBranch =
        branchFilter === "All branches" ||
        user.branch === branchFilter ||
        user.branchId === branchFilter;
      const matchesRole =
        roleFilter === "All roles" ||
        user.roleName === roleFilter ||
        user.roleId === roleFilter;
      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [users, search, branchFilter, roleFilter]);

  const handleRoleSelect = async (userId, roleId) => {
    setUpdatingUserId(userId);
    try {
      await onRoleChange(userId, roleId);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleBranchSelect = async (userId, branchId) => {
    setUpdatingUserId(userId);
    try {
      await onBranchChange(userId, branchId);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const assignedCount = users.filter((u) => u.roleId).length;
  const activeCount = users.filter((u) => u.isActive).length;
  const uniqueBranchesCount = new Set(users.map((u) => u.branch).filter(Boolean)).size;

  return (
    <>
      <section className="stats-grid" aria-label="User summary">
        <StatCard label="Total users" value={users.length} note="Registered accounts" icon="users" tint="blue" />
        <StatCard label="Assigned roles" value={assignedCount} note={`${users.length - assignedCount} unassigned`} icon="shield" tint="green" />
        <StatCard label="Active accounts" value={activeCount} note="Eligible for sign in" icon="approval" tint="violet" />
        <StatCard label="Branches" value={uniqueBranchesCount} note="Branch locations" icon="grid" tint="amber" />
      </section>

      <section className="panel users-panel">
        <div className="panel-heading">
          <div>
            <h2>All users <span className="heading-count">{filteredUsers.length}</span></h2>
            <p>Manage role assignments and transfer employees between active branches.</p>
          </div>
        </div>

        <div className="table-toolbar">
          <label className="search-field">
            <Icon name="search" size={17} />
            <input
              type="search"
              aria-label="Search users"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
                <Icon name="close" size={15} />
              </button>
            )}
          </label>

          <div className="toolbar-filters">
            <label className="select-wrap">
              <Icon name="filter" size={15} />
              <span className="select-value">{branchFilter}</span>
              <Icon name="chevron" size={14} />
              <select
                aria-label="Filter by branch"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option>All branches</option>
                {branchList.map((branchName) => (
                  <option key={branchName} value={branchName}>{branchName}</option>
                ))}
              </select>
            </label>

            <label className="select-wrap">
              <Icon name="shield" size={15} />
              <span className="select-value">{roleFilter}</span>
              <Icon name="chevron" size={14} />
              <select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table className="standard-table users-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>BRANCH</th>
                <th>ASSIGNED ROLE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-table-name">
                      <span className="avatar avatar-indigo user-avatar">
                        {initials(user.name)}
                      </span>
                      <span className="user-name-text">
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <label className="user-role-select-box user-branch-select-box">
                      <span className="user-role-select-text">
                        {updatingUserId === user.id ? "Updating..." : user.branch || "Unassigned"}
                      </span>
                      <Icon name="chevron" size={13} />
                      <select
                        aria-label={`Branch for ${user.name}`}
                        value={user.branchId ?? ""}
                        disabled={updatingUserId === user.id}
                        onChange={(event) => handleBranchSelect(user.id, event.target.value)}
                      >
                        {!user.branchId && <option value="" disabled>Select branch</option>}
                        {user.branchId && !branches.some((branch) => branch.id === user.branchId) && (
                          <option value={user.branchId}>{user.branch} (Inactive)</option>
                        )}
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </label>
                  </td>
                  <td>
                    <label className="user-role-select-box">
                      <span className="user-role-select-text">
                        {updatingUserId === user.id ? "Updating..." : user.roleName || "Unassigned"}
                      </span>
                      <Icon name="chevron" size={13} />
                      <select
                        aria-label={`Role for ${user.name}`}
                        value={user.roleId ?? ""}
                        disabled={updatingUserId === user.id}
                        onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                      >
                        {activeRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                        {user.roleId && !activeRoles.some((r) => r.id === user.roleId) && (
                          <option value={user.roleId}>{user.roleName} (Inactive)</option>
                        )}
                      </select>
                    </label>
                  </td>
                  <td>
                    <StatusTag status={user.isActive ? "Active" : "Inactive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="search" size={21} /></span>
              <strong>No users found</strong>
              <p>Try adjusting your search or filters.</p>
              <Button onClick={() => { setSearch(""); setBranchFilter("All branches"); setRoleFilter("All roles"); }}>
                Clear filters
              </Button>
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing <strong>{filteredUsers.length ? 1 : 0}–{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </span>
          <span className="table-footer-note">
            <Icon name="shield" size={13} /> Only active roles can be assigned
          </span>
        </div>
      </section>

      <div className="page-footnote">
        <Icon name="users" size={15} />
        <span>Mock users. Users are maintained in User Management (PDD-003). Role assignments take effect immediately.</span>
      </div>
    </>
  );
}

function ReportsPage({
  onRoleSummary,
  onPermissionMatrix,
  onRoleAssignments,
  onInactiveRoles,
}) {
  const reports = [
    { title: "Role summary", description: "Role names, status, scope, approvals, and assignment counts.", icon: "users", onExport: onRoleSummary },
    { title: "Permission matrix", description: "Granted actions for every role and module.", icon: "grid", onExport: onPermissionMatrix },
    { title: "Role assignment report", description: "User accounts with their assigned role, branch, and status.", icon: "approval", onExport: onRoleAssignments },
    { title: "Inactive roles", description: "A focused export of roles that are currently inactive.", icon: "history", onExport: onInactiveRoles },
  ];

  return (
    <>
      <section className="reports-intro panel">
        <span className="reports-intro-icon"><Icon name="download" size={20} /></span>
        <div><strong>Access-control reports</strong><p>Download current records as CSV files for review and recordkeeping.</p></div>
      </section>
      <section className="reports-grid" aria-label="Available reports">
        {reports.map((report) => (
          <article className="panel report-card" key={report.title}>
            <span className="report-icon"><Icon name={report.icon} size={19} /></span>
            <h2>{report.title}</h2>
            <p>{report.description}</p>
            <Button onClick={report.onExport}><Icon name="download" size={15} /> Export CSV</Button>
          </article>
        ))}
      </section>
    </>
  );
}

function CreateUserDialog({
  roles,
  branches,
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (password !== confirmation) {
      setFormError("The passwords do not match.");
      return;
    }
    if (!roles.some((role) => role.id === roleId) || !branches.some((branch) => branch.id === branchId)) {
      setFormError("Choose an active role and branch.");
      return;
    }
    setSaving(true);
    try {
      const saved = await onSave({ name: name.trim(), email: email.trim(), password, roleId, branchId });
      if (!saved) setFormError("The user could not be created. Review the error message and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog title="Add user" subtitle="Create an account and assign an active role and branch." onClose={onClose}>
      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field field-full"><span>Full name <i>*</i></span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} required /></label>
          <label className="field field-full"><span>Work email <i>*</i></span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} required /></label>
          <label className="field"><span>Role <i>*</i></span><select value={roleId} onChange={(event) => setRoleId(event.target.value)} required>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
          <label className="field"><span>Branch <i>*</i></span><select value={branchId} onChange={(event) => setBranchId(event.target.value)} required>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
          <label className="field field-full"><span>Initial password <i>*</i></span><span className="password-input-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /><button className="password-visibility-toggle" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={`${showPassword ? "Hide" : "Show"} initial password`} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button></span><small>Use at least 12 characters. Share it through your approved secure channel.</small></label>
          <label className="field field-full"><span>Confirm password <i>*</i></span><span className="password-input-wrap"><input type={showConfirmation ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /><button className="password-visibility-toggle" type="button" onClick={() => setShowConfirmation((current) => !current)} aria-label={`${showConfirmation ? "Hide" : "Show"} confirmation password`} aria-pressed={showConfirmation}>{showConfirmation ? "Hide" : "Show"}</button></span></label>
        </div>
        {!roles.length || !branches.length ? <p className="user-form-note" role="status">An active non-administrator role and branch are required before creating users.</p> : <p className="user-form-note">The protected System Administrator role can only be created through the initial setup flow. Production password recovery remains unavailable until a delivery channel is configured.</p>}
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="form-footer"><span><i>*</i> Required fields</span><div><Button type="button" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" variant="primary" disabled={saving || !roles.length || !branches.length}>{saving ? "Creating..." : "Create user"}</Button></div></div>
      </form>
    </Dialog>
  );
}

export default App;
