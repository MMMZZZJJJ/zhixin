/* 主入口文件 - 初始化应用 */

// 页面加载完成后初始化
let dashboardBootstrapped = false;
let mapInitScheduled = false;

function scheduleMapInit() {
    if (mapInitScheduled || typeof initMap !== 'function') {
        return;
    }
    mapInitScheduled = true;

    const startInit = function() {
        window.requestAnimationFrame(function() {
            window.requestAnimationFrame(function() {
                initMap();
            });
        });
    };

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(startInit, { timeout: 1200 });
        return;
    }
    window.setTimeout(startInit, 120);
}

async function bootstrapDashboard() {
    if (dashboardBootstrapped) {
        return;
    }
    dashboardBootstrapped = true;

    const hasToken = typeof getAccessToken === 'function' ? Boolean(getAccessToken()) : true;
    if (!hasToken) {
        if (typeof redirectToLogin === 'function') {
            redirectToLogin();
        }
        return;
    }

    scheduleMapInit();

    if (typeof checkAuthOrRedirect === 'function') {
        try {
            const authed = await checkAuthOrRedirect();
            if (!authed) {
                return;
            }
        } catch (error) {
            if (typeof clearAuthSession === 'function') {
                clearAuthSession();
            }
            if (typeof redirectToLogin === 'function') {
                redirectToLogin();
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapDashboard);
} else {
    bootstrapDashboard();
}
