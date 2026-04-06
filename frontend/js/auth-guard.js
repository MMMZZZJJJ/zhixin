function isApiRequest(url) {
    return /\/api\//.test(url);
}

function isAuthRequest(url) {
    return /\/api\/auth\//.test(url);
}

function buildRequestHeaders(existingHeaders) {
    const headers = new Headers(existingHeaders || {});
    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
}

async function authFetch(url, options = {}) {
    const headers = buildRequestHeaders(options.headers);
    const response = await window.__nativeFetch(url, { ...options, headers });
    if (response.status === 401) {
        clearAuthSession();
    }
    return response;
}

if (!window.__nativeFetch) {
    window.__nativeFetch = window.fetch.bind(window);
}
window.fetch = async function(input, init = {}) {
    const rawUrl = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    const absoluteUrl = rawUrl ? new URL(rawUrl, window.location.origin).toString() : '';
    if (!isApiRequest(absoluteUrl) || isAuthRequest(absoluteUrl)) {
        return window.__nativeFetch(input, init);
    }
    const response = await authFetch(input, init);
    if (response.status === 401) {
        redirectToLogin();
    }
    return response;
};

async function loginByPassword(username, password) {
    const { loginUrl } = getAuthConfig();
    const response = await window.__nativeFetch(loginUrl, {
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
async function registerByPassword(username, password) {
    const { registerUrl } = getAuthConfig();
    const response = await window.__nativeFetch(registerUrl, {
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
        let message = `注册失败(${response.status})`;
        if (data && typeof data === 'object') {
            if (data.detail) {
                message = data.detail;
            } else if (Array.isArray(data.username) && data.username[0]) {
                message = data.username[0];
            } else if (Array.isArray(data.password) && data.password[0]) {
                message = data.password[0];
            }
        }
        throw new Error(message);
    }
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
        clearAuthSession();
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
        clearAuthSession();
        return false;
    }
    redirectToDashboard();
    return true;
}
