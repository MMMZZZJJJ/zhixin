const APP_API_BASE = String(
    window.RUNTIME_CONFIG?.apiBaseUrl || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

window.APP_CONFIG = {
    auth: {
        baseUrl: `${APP_API_BASE}/auth`,
        passwordMinLength: Number(window.RUNTIME_CONFIG?.passwordMinLength || 10),
        loginPath: '/login/login.html',
        registerPath: '/login/register.html',
        dashboardPath: '/dashboard.html'
    },
    api: {
        seatPrediction: {
            url: `${APP_API_BASE}/seat-prediction`,
            method: 'GET'
        },
        taskPlanning: {
            url: `${APP_API_BASE}/task-planning`,
            method: 'GET'
        },
        dataDelivery: {
            url: `${APP_API_BASE}/data-delivery`,
            method: 'GET'
        }
    }
};
