/* 涓诲叆鍙ｆ枃浠?- 鍒濆鍖栧簲鐢?*/

// 椤甸潰鍔犺浇瀹屾垚鍚庡垵濮嬪寲
let dashboardBootstrapped = false;
let mapInitScheduled = false;
let orderScriptsWarmupScheduled = false;
const dashboardScriptPromises = new Map();

function loadDashboardScript(src) {
    if (dashboardScriptPromises.has(src)) {
        return dashboardScriptPromises.get(src);
    }

    const promise = new Promise(function(resolve, reject) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            if (existingScript.dataset.loaded === '1') {
                resolve();
                return;
            }
            existingScript.addEventListener('load', function() {
                existingScript.dataset.loaded = '1';
                resolve();
            }, { once: true });
            existingScript.addEventListener('error', function() {
                reject(new Error(`脚本加载失败: ${src}`));
            }, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = function() {
            script.dataset.loaded = '1';
            resolve();
        };
        script.onerror = function() {
            reject(new Error(`脚本加载失败: ${src}`));
        };
        document.body.appendChild(script);
    });

    dashboardScriptPromises.set(src, promise);
    return promise;
}

async function ensureCountryLabelsLoaded() {
    if (window.ENABLE_COUNTRY_LABELS !== true || typeof addCountryLabels === 'function') {
        return;
    }
    await loadDashboardScript('js/country-labels.js');
}

async function ensureOrderScriptsLoaded() {
    await loadDashboardScript('js/task-submit.js');
    await loadDashboardScript('js/seat-query.js');
}

async function ensureDeliveryScriptsLoaded() {
    await loadDashboardScript('js/data-delivery.js');
}

window.ensureCountryLabelsLoaded = ensureCountryLabelsLoaded;

const placeOrderBootstrap = async function(...args) {
    try {
        await ensureOrderScriptsLoaded();
        if (window.placeOrder !== placeOrderBootstrap) {
            return window.placeOrder(...args);
        }
    } catch (error) {
        window.alert(error.message || '下单模块加载失败，请稍后重试');
    }
};

const queryDataDeliveryBootstrap = async function(...args) {
    try {
        await ensureDeliveryScriptsLoaded();
        if (window.queryDataDelivery !== queryDataDeliveryBootstrap) {
            return window.queryDataDelivery(...args);
        }
    } catch (error) {
        window.alert(error.message || '交付模块加载失败，请稍后重试');
    }
};

if (typeof window.placeOrder !== 'function') {
    window.placeOrder = placeOrderBootstrap;
}
if (typeof window.queryDataDelivery !== 'function') {
    window.queryDataDelivery = queryDataDeliveryBootstrap;
}

function scheduleOrderScriptsWarmup() {
    if (orderScriptsWarmupScheduled) {
        return;
    }
    orderScriptsWarmupScheduled = true;

    const warmup = function() {
        ensureOrderScriptsLoaded().catch(function() {});
    };

    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(warmup, { timeout: 2500 });
        return;
    }

    window.setTimeout(warmup, 1800);
}

function scheduleMapInit() {
    if (mapInitScheduled || typeof initMap !== 'function') {
        return;
    }
    mapInitScheduled = true;

    const startInit = function() {
        window.requestAnimationFrame(function() {
            window.setTimeout(function() {
                initMap();
            }, 80);
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
            return;
        }
    }

    scheduleMapInit();
    scheduleOrderScriptsWarmup();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapDashboard);
} else {
    bootstrapDashboard();
}
