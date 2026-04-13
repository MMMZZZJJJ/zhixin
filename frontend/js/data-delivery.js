/* 数据交付模块 */

async function queryDataDelivery() {
    const btn = document.getElementById('btn-data-delivery');
    if (!btn) return;

    const originalText = btn.innerText;
    btn.innerText = '查询中...';
    btn.disabled = true;

    try {
        const dataDeliveryConfig = window.APP_CONFIG?.api?.dataDelivery || {};
        const apiUrl = dataDeliveryConfig.url || '/api/data-delivery';
        const requestOptions = {
            method: dataDeliveryConfig.method || 'GET'
        };
        const headers = dataDeliveryConfig.headers || {};
        if (Object.keys(headers).length > 0) {
            requestOptions.headers = headers;
        }

        const requester = typeof authFetch === 'function' ? authFetch : fetch;
        const response = await requester(apiUrl, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        const dataList = Array.isArray(data) ? data : [data];
        showDeliveryModal(dataList);
    } catch (error) {
        alert(
            `交付数据查询失败：${error.message}\n\n` +
            `可能原因：\n` +
            `1. 网络连接问题\n` +
            `2. 接口服务未启动\n` +
            `3. 后端未配置跨域响应头（Access-Control-Allow-Origin）`
        );
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function showDeliveryModal(dataList) {
    const modalBody = document.getElementById('deliveryModalBody');

    if (!dataList || dataList.length === 0 || !dataList[0]['01-SourceName']) {
        modalBody.innerHTML = `
            <div class="no-result">
                <div class="no-result-icon">📭</div>
                <p style="font-size: 16px; color: #666;">暂无已交付的数据</p>
            </div>
        `;
    } else {
        let html = `
            <div class="result-info">
                <p><strong>查询结果：</strong>共找到 ${dataList.length} 条交付数据</p>
                <p style="color: #e6a23c; font-size: 12px; margin-top: 5px;">⚠️ 注意：数据提取链接有效期为 24 小时</p>
            </div>
        `;

        dataList.forEach((item, index) => {
            const sourceName = item['01-SourceName'] || '未知卫星';
            const obsDataPay = item['02-ObsDataPay'] || '暂无提取信息';

            html += `
                <div class="seat-card">
                    <h3>交付数据 ${index + 1}</h3>
                    <div class="info-row">
                        <span class="info-label">卫星名称：</span>
                        <span class="info-value">${sourceName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">下载信息：</span>
                        <span class="info-value" style="word-break: break-all; line-height: 1.4;">${obsDataPay}</span>
                    </div>
                    <div class="task-submit-box" style="margin-top: 15px;">
                        <button class="btn btn-secondary" onclick="copyDeliveryInfo('${escapeForSingleQuotedAttr(obsDataPay)}')">复制下载信息</button>
                    </div>
                </div>
            `;
        });

        modalBody.innerHTML = html;
    }

    document.getElementById('deliveryModal').style.display = 'block';
}

function closeDeliveryModal() {
    document.getElementById('deliveryModal').style.display = 'none';
}

function copyDeliveryInfo(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ 下载信息已复制到剪贴板！');
        }).catch(() => {
            alert('❌ 复制失败，请手动选中复制。');
        });
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('✅ 下载信息已复制到剪贴板！');
    } catch (err) {
        alert('❌ 复制失败，请手动选中复制。');
    }
    document.body.removeChild(textarea);
}

function escapeForSingleQuotedAttr(text) {
    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '')
        .replace(/\n/g, '\\n');
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('deliveryModal');
    if (event.target === modal) {
        closeDeliveryModal();
    }
});
