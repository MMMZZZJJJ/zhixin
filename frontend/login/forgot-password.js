const forgotForm = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const forgotError = document.getElementById('forgotError');
const forgotSubmitButton = forgotForm ? forgotForm.querySelector('button[type="submit"]') : null;

forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    forgotError.textContent = '';
    forgotError.style.color = 'var(--danger)';

    const email = String(emailInput.value || '').trim();
    if (!email) {
        forgotError.textContent = '请输入注册邮箱';
        return;
    }

    const { baseUrl } = getAuthConfig();
    try {
        if (forgotSubmitButton) forgotSubmitButton.disabled = true;
        const response = await window.__nativeFetch(`${baseUrl}/password/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            throw new Error((data && data.detail) ? data.detail : `发送失败(${response.status})`);
        }

        forgotError.style.color = '#1b9a59';
        forgotError.textContent = (data && data.detail) ? data.detail : '重置邮件已发送，请注意查收。';
    } catch (e) {
        forgotError.textContent = e && e.message ? e.message : '发送失败';
    } finally {
        if (forgotSubmitButton) forgotSubmitButton.disabled = false;
    }
});
