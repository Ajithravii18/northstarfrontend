import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MotionConfig, motion, useReducedMotion, useScroll } from "framer-motion";
import { api, ApiError } from "./api";

function Brand({ inverse = false }) {
  return (
    <span className={`public-brand ${inverse ? "public-brand-inverse" : ""}`}>
      <span className="public-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <span className="public-brand-name">northstar<span>ERP</span></span>
    </span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

function Reveal({
  children,
  className = "",
  delay = 0,
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.68, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage({ onLogin }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="gateway-page">
        <ScrollProgress />

        {/* Gateway Header Navbar */}
        <header className="gateway-header">
          <div className="gateway-header-container">
            <Link to="/" className="gateway-brand" aria-label="Northstar ERP">
              <Brand inverse />
            </Link>
            <nav className="gateway-nav" aria-label="Gateway Navigation">
              <a href="#overview">Overview</a>
              <a href="#why-access-control">Why Access Control</a>
              <a href="#architecture">Architecture</a>
              <a href="#roles">Enterprise Personas</a>
            </nav>
            <div className="gateway-header-actions">
              <button
                type="button"
                className="public-button public-button-primary gateway-signin-btn"
                onClick={onLogin}
              >
                Sign In
                <ArrowIcon />
              </button>
            </div>
          </div>
        </header>

        <main className="gateway-main">
          {/* Hero Section */}
          <section className="gateway-hero" id="overview">
            <div className="gateway-hero-container">
              <motion.div
                className="gateway-hero-copy"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 0.68, 0, 1] }}
              >
                <h1>
                  Enterprise Role-Based Access Control <span>&amp; Governance Portal</span>
                </h1>
                <p className="gateway-hero-sub">
                  A focused demo for managing reusable roles and access settings.
                  Configure module permissions, branch scopes, approval levels, and user assignments.
                </p>
                <div className="gateway-hero-cta">
                  <button
                    type="button"
                    className="public-button public-button-primary gateway-hero-btn"
                    onClick={onLogin}
                  >
                    Sign In to Console
                    <ArrowIcon />
                  </button>
                  <a href="#why-access-control" className="gateway-secondary-link">
                    Explore Architecture &rarr;
                  </a>
                </div>
                <div className="gateway-security-badges">
                  <span><ShieldIcon /> Role Templates</span>
                  <span><LockIcon /> Secure Sessions</span>
                  <span><AuditIcon /> Change Audit Trail</span>
                </div>
              </motion.div>

              <motion.div
                className="gateway-hero-card"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 0.68, 0, 1] }}
              >
                <div
                  className="gateway-access-visual"
                  role="img"
                  aria-label="Access control settings for 8 modules and 48 permission choices"
                >
                  <span className="access-orbit access-orbit-outer" />
                  <span className="access-orbit access-orbit-inner" />
                  <div className="access-orbit-hub" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <path d="m24 5 15 6v11c0 10-6 17-15 21C15 39 9 32 9 22V11l15-6Z" />
                      <path d="m18 23 4 4 8-9" />
                    </svg>
                  </div>
                  <div className="access-stat access-stat-modules">
                    <strong>08</strong>
                    <span>Modules</span>
                  </div>
                  <div className="access-stat access-stat-actions">
                    <strong>48</strong>
                    <span>Permission choices</span>
                  </div>
                  <span className="access-visual-caption">Roles · branch scopes · approvals</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 1: Why Access Control is Required */}
          <section className="gateway-section" id="why-access-control">
            <div className="gateway-container">
              <div className="gateway-section-title-wrap">
                <span className="gateway-section-kicker">ENTERPRISE GOVERNANCE</span>
                <h2>Access settings in one place</h2>
                <p>
                  Define reusable access profiles, review who has each role, and keep a record of
                  administrative changes. This assignment demo uses mock user and branch data.
                </p>
              </div>

              <div className="gateway-four-grid">
                <div className="gateway-feature-card">
                  <div className="feature-icon icon-sod">
                    <ShieldIcon />
                  </div>
                  <h3>Fine-Grained Permissions</h3>
                  <p>
                    Configure View, Create, Edit, Delete, Approve, and Export permissions across the available modules.
                  </p>
                  <div className="feature-tags">
                    <span>8 Modules</span>
                    <span>6 Actions</span>
                  </div>
                </div>

                <div className="gateway-feature-card">
                  <div className="feature-icon icon-approval">
                    <ApprovalIcon />
                  </div>
                  <h3>Approval Settings</h3>
                  <p>
                    Set an approval level and optional amount limit on each role for use by connected approval workflows.
                  </p>
                  <div className="feature-tags">
                    <span>Approval Levels</span>
                    <span>Optional Limits</span>
                  </div>
                </div>

                <div className="gateway-feature-card">
                  <div className="feature-icon icon-branch">
                    <LockIcon />
                  </div>
                  <h3>Branch Scope Settings</h3>
                  <p>
                    Set a role to an assigned branch, selected branches, or all branches. Business-data enforcement belongs to the connected ERP modules.
                  </p>
                  <div className="feature-tags">
                    <span>Three Scope Options</span>
                    <span>Branch Scopes</span>
                  </div>
                </div>

                <div className="gateway-feature-card">
                  <div className="feature-icon icon-audit">
                    <AuditIcon />
                  </div>
                  <h3>Administrative Audit Trail</h3>
                  <p>
                    Record role, permission, scope, approval, and assignment changes with an actor and timestamp for review.
                  </p>
                  <div className="feature-tags">
                    <span>Actor and Time</span>
                    <span>Change History</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Working Ideas & System Architecture */}
          <section className="gateway-section gateway-section-dark" id="architecture">
            <div className="gateway-container">
              <div className="gateway-section-title-wrap">
                <span className="gateway-section-kicker">MERN ARCHITECTURE</span>
                <h2>How the access-control demo works</h2>
                <p>
                  An administrator signs in, configures roles and assignments, and reviews the resulting access settings.
                </p>
              </div>

              <div className="gateway-flow-grid">
                <div className="flow-step-card">
                  <div className="flow-step-badge">STAGE 01</div>
                  <h3>Administrator Sign-In</h3>
                  <p>
                    Passwords are verified against bcrypt hashes. The server issues an HTTP-only session cookie after successful sign-in.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="flow-step-badge">STAGE 02</div>
                  <h3>Role Configuration</h3>
                  <p>
                    Roles store module permissions, branch scope settings, approval levels, and optional limits.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="flow-step-badge">STAGE 03</div>
                  <h3>Permission Matrix</h3>
                  <p>
                    Administrators can review and update the available actions for each module. Business APIs that enforce these settings are outside this demo.
                  </p>
                </div>

                <div className="flow-step-card">
                  <div className="flow-step-badge">STAGE 04</div>
                  <h3>Audit History</h3>
                  <p>
                    Role and assignment changes are saved with audit events so administrators can review what changed and who made it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Standard Pre-Configured Personas */}
          <section className="gateway-section" id="roles">
            <div className="gateway-container">
              <div className="gateway-section-title-wrap">
                <span className="gateway-section-kicker">CONFIGURED PERSONAS</span>
                <h2>Enterprise Roles Configured in This Console</h2>
                <p>
                  Explore the pre-configured role archetypes available in this Task 1 Access Control system:
                </p>
              </div>

              <div className="gateway-roles-grid">
                <div className="gateway-role-card">
                  <div className="role-top">
                    <span className="role-avatar role-avatar-admin">SA</span>
                    <div>
                      <h4>System Administrator</h4>
                      <span className="role-badge role-badge-admin">Global Full Access</span>
                    </div>
                  </div>
                  <p className="role-description">
                    Exclusive authority to manage roles, edit permission matrices, provision user accounts, set approval policies, and inspect system audit trails.
                  </p>
                  <div className="role-specs-row">
                    <span><strong>Scope:</strong> All Branches</span>
                    <span><strong>Authority:</strong> Level 3 (Unlimited)</span>
                  </div>
                </div>

                <div className="gateway-role-card">
                  <div className="role-top">
                    <span className="role-avatar role-avatar-mgr">BM</span>
                    <div>
                      <h4>Branch Manager</h4>
                      <span className="role-badge role-badge-mgr">Regional Leadership</span>
                    </div>
                  </div>
                  <p className="role-description">
                    Supervises regional branch transactions across Sales, Inventory, and Accounts, with elevated sanctioning limits for local operational approvals.
                  </p>
                  <div className="role-specs-row">
                    <span><strong>Scope:</strong> Assigned Branch</span>
                    <span><strong>Authority:</strong> Level 2 (₹1,00,000)</span>
                  </div>
                </div>

                <div className="gateway-role-card">
                  <div className="role-top">
                    <span className="role-avatar role-avatar-acct">SR</span>
                    <div>
                      <h4>Senior Accountant</h4>
                      <span className="role-badge role-badge-acct">Financial Ledger</span>
                    </div>
                  </div>
                  <p className="role-description">
                    Oversees general ledgers, accounts payable/receivable, tax invoices, bank reconciliation, and financial reporting exports.
                  </p>
                  <div className="role-specs-row">
                    <span><strong>Scope:</strong> Selected Branches</span>
                    <span><strong>Authority:</strong> Level 2 (₹50,000)</span>
                  </div>
                </div>

                <div className="gateway-role-card">
                  <div className="role-top">
                    <span className="role-avatar role-avatar-inv">IS</span>
                    <div>
                      <h4>Inventory Supervisor</h4>
                      <span className="role-badge role-badge-inv">Stock Control</span>
                    </div>
                  </div>
                  <p className="role-description">
                    Oversees warehouse stock movements, goods receipt notes, inter-branch stock transfers, and routine inventory auditing.
                  </p>
                  <div className="role-specs-row">
                    <span><strong>Scope:</strong> Assigned Branch</span>
                    <span><strong>Authority:</strong> Level 1 (₹25,000)</span>
                  </div>
                </div>

                <div className="gateway-role-card">
                  <div className="role-top">
                    <span className="role-avatar role-avatar-cash">CS</span>
                    <div>
                      <h4>Cashier</h4>
                      <span className="role-badge role-badge-cash">POS Frontline</span>
                    </div>
                  </div>
                  <p className="role-description">
                    Operates frontline POS retail billing, cash collection, and customer invoice printing under strict operational limits.
                  </p>
                  <div className="role-specs-row">
                    <span><strong>Scope:</strong> Single Counter Branch</span>
                    <span><strong>Authority:</strong> Level 1 (₹10,000)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call-to-action Section */}
          <section className="gateway-cta-banner">
            <div className="gateway-container">
              <div className="gateway-cta-card">
                <h2>Ready to Access the Security Console?</h2>
                <p>
                  Sign in as System Administrator to manage roles, permissions, and users, or sign in as an operational user to verify active credentials and inherited rights.
                </p>
                <div className="gateway-cta-buttons">
                  <button
                    type="button"
                    className="public-button public-button-primary gateway-cta-btn"
                    onClick={onLogin}
                  >
                    Sign In to Northstar ERP
                    <ArrowIcon />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Gateway Footer */}
        <footer className="gateway-footer">
          <div className="gateway-container gateway-footer-inner">
            <Brand inverse />
            <p>&copy; {new Date().getFullYear()} Northstar ERP Systems &bull; Role-Based Access Control Module (Task 1) &bull; MERN Architecture</p>
            <button type="button" className="gateway-footer-login" onClick={onLogin}>
              Access Console &rarr;
            </button>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

export function LoginPage({
  setupRequired,
  onAuthenticated,
  serverError,
}) {
  const [mode, setMode] = useState(setupRequired ? "setup" : "login");
  const [name, setName] = useState("Administrator");
  const [email, setEmail] = useState("admin@northstar.io");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState(serverError ?? "");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login" && setupRequired) {
        setMode("setup");
        setError("Administrator setup is required first. Create your administrator account to continue.");
        setBusy(false);
        return;
      }
      const user =
        mode === "setup"
          ? await api.setup({ token, name: name.trim() || "Administrator", email, password })
          : await api.login(email, password);
      onAuthenticated(user);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="auth-page">
        <ScrollProgress />
        <motion.aside
          className="auth-aside"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 0.68, 0, 1] }}
        >
          <div className="brand-link"><Brand inverse /></div>
          <div className="auth-aside-content">
            <span className="auth-overline"><span /> SETTINGS / ACCESS CONTROL</span>
            <h1>Access Control<br /><span>&amp; RBAC</span></h1>
            <p>Manage roles, permissions, approval limits, and audit logs across your organization.</p>
          </div>
          <div className="auth-aside-footer"><span>NORTHSTAR ERP</span><span>RBAC Console</span></div>
        </motion.aside>

        <motion.section
          className="auth-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 0.68, 0, 1] }}
        >
          <div className="auth-panel-top">
            <Link to="/" className="auth-back-link">&larr; Portal overview</Link>
            <span className="auth-online-dot-wrap"><span className="auth-online-dot" /> Secure sign-in</span>
          </div>
          <div className="auth-form-wrap">
            <div className="auth-mobile-brand"><Brand /></div>
            <span className="auth-form-kicker">{mode === "setup" ? "WORKSPACE SETUP" : "ENTERPRISE ACCESS"}</span>
            <h2>{mode === "setup" ? "Set up your administrator" : "Sign in to Northstar ERP"}</h2>
            <p className="auth-form-description">
              {mode === "setup"
                ? "Create the first administrator account to secure this workspace."
                : "Enter your credentials to continue to the access control console."}
            </p>
            {serverError && <div className="auth-server-warning" role="status">{serverError}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "setup" && (
                <>
                  <label className="auth-field"><span>One-time setup token</span><input value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" required minLength={32} placeholder="Paste the token from the server console" /></label>
                  <label className="auth-field"><span>Administrator name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={120} placeholder="Your name" /></label>
                </>
              )}
              <label className="auth-field"><span>Work email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required maxLength={254} placeholder="admin@northstar.io" /></label>
              <label className="auth-field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "setup" ? "new-password" : "current-password"} required minLength={mode === "setup" ? 12 : 1} maxLength={128} placeholder="Enter your password" /></label>
              {mode === "login" && <Link className="auth-forgot-link" to="/forgot-password">Forgot password?</Link>}
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button type="submit" className="public-button public-button-primary auth-submit" disabled={busy}>
                {busy ? "Please wait..." : mode === "setup" ? "Create administrator" : "Sign in to Access Control"}
                {!busy && <ArrowIcon />}
              </button>
            </form>
            {setupRequired && (
              <div className="auth-mode-switch">
                {mode === "setup" ? <>Already initialized? <button type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button></> : <>First time here? <button type="button" onClick={() => { setMode("setup"); setError(""); }}>Set up administrator</button></>}
              </div>
            )}
            {mode === "login" && <p className="auth-help">Need access? Contact your system administrator.</p>}
            <div className="auth-security-note"><LockIcon /><span>Your session is protected with a secure, HTTP-only cookie.</span></div>
          </div>
          <footer className="auth-footer"><span>© {new Date().getFullYear()} Northstar ERP</span><span>Access Control</span></footer>
        </motion.section>
      </main>
    </MotionConfig>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [developmentMode, setDevelopmentMode] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api.forgotPassword(email.trim());
      setDevelopmentMode(result.developmentLinkInConsole === true);
      setSent(true);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <RecoveryFrame kicker="ACCOUNT RECOVERY" title="Forgot your password?" description="Enter your work email to request secure account recovery.">
      {sent ? (
        <div className="auth-success" role="status">
          If an account exists for that address, recovery instructions will be provided.
          {developmentMode && <><br />In local development, the reset link is printed in the API server console.</>}
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Work email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="you@company.com" />
          </label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button type="submit" className="public-button public-button-primary auth-submit" disabled={busy}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <Link className="auth-recovery-link" to="/login">Back to sign in</Link>
    </RecoveryFrame>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, password, confirmation);
      setComplete(true);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <RecoveryFrame kicker="SECURE RESET" title="Choose a new password" description="Use at least 12 characters for your new password.">
      {complete ? (
        <div className="auth-success" role="status">Your password has been updated. You can now sign in.</div>
      ) : !token ? (
        <div className="auth-error" role="alert">This reset link is missing or invalid. Request a new reset link to continue.</div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>New password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={12} maxLength={128} />
          </label>
          <label className="auth-field">
            <span>Confirm new password</span>
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required minLength={12} maxLength={128} />
          </label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button type="submit" className="public-button public-button-primary auth-submit" disabled={busy}>
            {busy ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
      {complete ? <Link className="auth-recovery-link" to="/login">Continue to sign in</Link> : <Link className="auth-recovery-link" to="/forgot-password">Request another reset link</Link>}
    </RecoveryFrame>
  );
}

function RecoveryFrame({
  kicker,
  title,
  description,
  children,
}) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="auth-page">
        <motion.aside
          className="auth-aside"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 0.68, 0, 1] }}
        >
          <Link to="/" className="brand-link"><Brand inverse /></Link>
          <div className="auth-aside-content">
            <span className="auth-overline"><span /> PRIVATE WORKSPACE</span>
            <h1>Welcome to<br /><span>Northstar.</span></h1>
            <p>Secure access for the people and teams we work with.</p>
          </div>
          <div className="auth-aside-footer"><span>PRIVATE CLIENT ACCESS</span><span>Northstar ERP</span></div>
        </motion.aside>
        <motion.section
          className="auth-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 0.68, 0, 1] }}
        >
          <div className="auth-panel-top"><Link to="/" className="auth-back-link">← Back to overview</Link><span><span className="auth-online-dot" /> Secure sign-in</span></div>
          <div className="auth-form-wrap">
            <span className="auth-form-kicker">{kicker}</span>
            <h2>{title}</h2>
            <p className="auth-form-description">{description}</p>
            {children}
          </div>
          <footer className="auth-footer"><span>© {new Date().getFullYear()} Northstar ERP</span><span>Private workspace</span></footer>
        </motion.section>
      </main>
    </MotionConfig>
  );
}

export function LoadingPage({ message = "Checking your secure session..." }) {
  return <main className="loading-page"><span className="loading-mark"><ShieldIcon /></span><strong>Northstar ERP</strong><span>{message}</span><span className="loading-line" /></main>;
}

export function AccessDeniedPage({ onLogout }) {
  return (
    <main className="access-denied-page">
      <Brand />
      <span className="access-denied-icon"><LockIcon /></span>
      <h1>Administrator access required</h1>
      <p>This workspace is currently configured for System Administrators. Ask your administrator to provision the access-control module for your account.</p>
      <button className="public-button public-button-primary" type="button" onClick={onLogout}>Sign out</button>
    </main>
  );
}

export function UserSessionPortal({ user, onLogout }) {
  const permissionsList = Object.entries(user?.permissions || {}).filter(
    ([, actions]) => Array.isArray(actions) && actions.length > 0
  );

  return (
    <main className="user-portal-page">
      <header className="user-portal-header">
        <Brand />
        <button className="public-button public-button-secondary" type="button" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <div className="user-portal-container">
        <div className="user-portal-hero">
          <div className="portal-badge-status">
            <span className="portal-status-dot" />
            Active Authenticated Session
          </div>
          <h1>Welcome, {user?.name || "User"}</h1>
          <p className="portal-hero-sub">
            Your login credentials have been verified successfully via <strong>bcrypt</strong> password hashing and a secure HTTP-only JWT cookie.
          </p>
        </div>

        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-card-header">
              <h3>Account Profile</h3>
              <span className="portal-verified-pill">Verified Active</span>
            </div>
            <div className="portal-data-rows">
              <div className="portal-row">
                <span className="portal-label">Full Name</span>
                <span className="portal-value">{user?.name}</span>
              </div>
              <div className="portal-row">
                <span className="portal-label">Email / User ID</span>
                <span className="portal-value">{user?.email}</span>
              </div>
              <div className="portal-row">
                <span className="portal-label">Assigned Role</span>
                <span className="portal-value portal-role-tag">{user?.roleName || "Unassigned"}</span>
              </div>
              <div className="portal-row">
                <span className="portal-label">Branch Assignment</span>
                <span className="portal-value">{user?.branchName || "Central"}</span>
              </div>
              <div className="portal-row">
                <span className="portal-label">Approval Authority</span>
                <span className="portal-value">
                  Level {user?.approvalLevel ?? 1} &bull; {user?.approvalLimit ? `₹${Number(user.approvalLimit).toLocaleString("en-IN")}` : "Operational Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-card-header">
              <h3>Assigned Role Permissions</h3>
              <span className="portal-count-pill">{permissionsList.length} Modules Granted</span>
            </div>
            <p className="portal-card-desc">
              Your account inherits the access privileges configured for the <strong>{user?.roleName}</strong> role:
            </p>
            <div className="portal-permissions-list">
              {permissionsList.length > 0 ? (
                permissionsList.map(([mod, actions]) => (
                  <div key={mod} className="portal-perm-item">
                    <span className="portal-perm-module">{mod}</span>
                    <div className="portal-perm-actions">
                      {actions.map((act) => (
                        <span key={act} className="portal-action-badge">{act}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="portal-no-perm">No operational module actions assigned.</p>
              )}
            </div>
          </div>
        </div>

        <div className="portal-note-box">
          <div className="portal-note-icon">
            <ShieldIcon />
          </div>
          <div>
            <strong>Access Control Architecture Notice (Task 1 Scope)</strong>
            <p>
              This console is the central <em>Role-Based Access Control (RBAC) System</em> where System Administrators manage roles, permissions matrix, approvals, users, and audit logs. As a <strong>{user?.roleName}</strong>, your credentials and role permissions are now active across Northstar ERP operational modules.
            </p>
          </div>
        </div>

        <div className="portal-actions">
          <button className="public-button public-button-primary" type="button" onClick={onLogout}>
            Sign out of this session
          </button>
        </div>
      </div>
    </main>
  );
}

function ArrowIcon() {
  return <svg className="public-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></svg>;
}

function ApprovalIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" /><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" /></svg>;
}

function AuditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16M4 12h10M4 19h7" /><circle cx="18" cy="16.5" r="3.5" /><path d="M18 14.5v2l1.5 1" /></svg>;
}
