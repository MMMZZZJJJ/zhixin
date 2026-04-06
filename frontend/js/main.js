/* 主入口文件 - 初始化应用 */

// 页面加载完成后初始化
window.onload = async function() {
    if (typeof checkAuthOrRedirect === 'function') {
        const authed = await checkAuthOrRedirect();
        if (!authed) {
            return;
        }
    }
    initMap();
};
