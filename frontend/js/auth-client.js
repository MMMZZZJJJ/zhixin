const AUTH_ACCESS_TOKEN_KEY = 'zs_access_token';
const AUTH_REFRESH_TOKEN_KEY = 'zs_refresh_token';
const AUTH_USER_KEY = 'zs_auth_user';

function getAuthConfig() {
    const authConfig = window.APP_CONFIG?.auth || {};
    const baseUrl = String(authConfig.baseUrl || 'http://127.0.0.1:8000/api/auth').replace(/\/+$/, '');
    return {
        baseUrl,
        loginUrl: authConfig.loginUrl || `${baseUrl}/login`,
        registerUrl: authConfig.registerUrl || `${baseUrl}/register`,
        meUrl: authConfig.meUrl || `${baseUrl}/me`,
        dashboardPath: authConfig.dashboardPath || '/dashboard.html',
        loginPath: authConfig.loginPath || '/login/login.html'
    };
}

function getAccessToken() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || '';
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

async function authFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        clearAuthSession();
    }
    return response;
}

async function loginByPassword(username, password) {
    const { loginUrl } = getAuthConfig();
    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }
    if (!response.ok) {
        const message = data && data.detail ? data.detail : `登录失败(${response.status})`;
        throw new Error(message);
    }
    setAuthSession(data || {});
    return data;
}

async function checkAuthOrRedirect() {
    const { meUrl } = getAuthConfig();
    const token = getAccessToken();
    if (!token) {
        redirectToLogin();
        return false;
    }
    const response = await authFetch(meUrl, { method: 'GET' });
    if (!response.ok) {
        redirectToLogin();
        return false;
    }
    return true;
}

async function checkAuthForLoginPage() {
    const { meUrl } = getAuthConfig();
    const token = getAccessToken();
    if (!token) {
        return false;
    }
    const response = await authFetch(meUrl, { method: 'GET' });
    if (!response.ok) {
        return false;
    }
    redirectToDashboard();
    return true;
}
