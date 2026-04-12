const AUTH_ACCESS_TOKEN_KEY = 'zs_access_token';
const AUTH_REFRESH_TOKEN_KEY = 'zs_refresh_token';
const AUTH_USER_KEY = 'zs_auth_user';

function getAuthConfig() {
    const authConfig = window.APP_CONFIG?.auth || {};
    const baseUrl = String(authConfig.baseUrl || 'http://127.0.0.1:9504/api/auth').replace(/\/+$/, '');
    return {
        baseUrl,
        loginUrl: authConfig.loginUrl || `${baseUrl}/login`,
        logoutUrl: authConfig.logoutUrl || `${baseUrl}/logout`,
        registerUrl: authConfig.registerUrl || `${baseUrl}/register`,
        meUrl: authConfig.meUrl || `${baseUrl}/me`,
        passwordMinLength: Number(authConfig.passwordMinLength || 10),
        dashboardPath: authConfig.dashboardPath || '/dashboard.html',
        loginPath: authConfig.loginPath || '/login/login.html',
        registerPath: authConfig.registerPath || '/login/register.html'
    };
}

function getAccessToken() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || '';
}

function getRefreshToken() {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || '';
}

function getAuthUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setAuthSession(payload) {
    const access = String(payload?.access || '').trim();
    const refresh = String(payload?.refresh || '').trim();
    const user = payload?.user || null;
    if (access) {
        localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, access);
    }
    if (refresh) {
        localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refresh);
    }
    if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function redirectToLogin() {
    const { loginPath } = getAuthConfig();
    if (!window.location.pathname.endsWith(loginPath)) {
        window.location.href = loginPath;
    }
}

function redirectToDashboard() {
    const { dashboardPath } = getAuthConfig();
    window.location.href = dashboardPath;
}

function redirectToRegister() {
    const { registerPath } = getAuthConfig();
    window.location.href = registerPath;
}

async function logoutCurrentUser() {
    const { logoutUrl } = getAuthConfig();
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const requestFetch = window.__nativeFetch || window.fetch.bind(window);

    try {
        if (accessToken && refreshToken) {
            await requestFetch(logoutUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refresh: refreshToken })
            });
        }
    } catch (e) {
    } finally {
        clearAuthSession();
        redirectToLogin();
    }
}
