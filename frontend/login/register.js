const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerFullName = document.getElementById('registerFullName');
const registerCompany = document.getElementById('registerCompany');
const registerPhone = document.getElementById('registerPhone');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
const registerError = document.getElementById('registerError');
const registerSubmitButton = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

window.addEventListener('load', async () => {
    const token = getAccessToken();
    if (token && typeof checkAuthForLoginPage === 'function') {
        await checkAuthForLoginPage();
    }
});

function pickErrorMessage(payload, statusCode) {
    if (!payload || typeof payload !== 'object') {
        return `注册失败(${statusCode})`;
    }
    if (payload.detail) return String(payload.detail);
    const fieldOrder = ['username', 'email', 'password', 'full_name', 'phone', 'company_name'];
    for (const key of fieldOrder) {
        const value = payload[key];
        if (Array.isArray(value) && value[0]) {
            return String(value[0]);
        }
    }
    return `注册失败(${statusCode})`;
}

function validateStrongPassword(password, minLength) {
    if (password.length < minLength) {
        return `密码长度至少 ${minLength} 位`;
    }
    if (!/[A-Z]/.test(password)) {
        return '密码必须包含至少一个大写字母';
    }
    if (!/[a-z]/.test(password)) {
        return '密码必须包含至少一个小写字母';
    }
    if (!/[0-9]/.test(password)) {
        return '密码必须包含至少一个数字';
    }
    if (/\s/.test(password)) {
        return '密码不能包含空格';
    }
    return '';
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    registerError.textContent = '';
    registerError.style.color = 'var(--danger)';

    const username = String(registerUsername.value || '').trim();
    const email = String(registerEmail.value || '').trim();
    const fullName = String(registerFullName.value || '').trim();
    const companyName = String(registerCompany.value || '').trim();
    const phone = String(registerPhone.value || '').trim();
    const password = String(registerPassword.value || '');
    const passwordConfirm = String(registerPasswordConfirm.value || '');

    if (!username || !email || !password || !passwordConfirm) {
        registerError.textContent = '请填写完整注册信息（账号、邮箱、密码）';
        return;
    }

    const { registerUrl, passwordMinLength } = getAuthConfig();
    const passwordMessage = validateStrongPassword(password, passwordMinLength);
    if (passwordMessage) {
        registerError.textContent = passwordMessage;
        return;
    }

    if (password !== passwordConfirm) {
        registerError.textContent = '两次输入的密码不一致';
        return;
    }

    try {
        if (registerSubmitButton) registerSubmitButton.disabled = true;
        const response = await window.__nativeFetch(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                full_name: fullName,
                company_name: companyName,
                phone
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            throw new Error(pickErrorMessage(data, response.status));
        }

        registerError.style.color = '#1b9a59';
        registerError.textContent = '注册成功，正在跳转登录页...';
        window.location.href = `./login.html?username=${encodeURIComponent(username)}`;
    } catch (e) {
        registerError.textContent = e && e.message ? e.message : '注册失败';
    } finally {
        if (registerSubmitButton) registerSubmitButton.disabled = false;
    }
});
