const resetForm = document.getElementById('resetForm');
const newPassword = document.getElementById('newPassword');
const newPasswordConfirm = document.getElementById('newPasswordConfirm');
const resetError = document.getElementById('resetError');
const resetSubmitButton = resetForm ? resetForm.querySelector('button[type="submit"]') : null;

const params = new URLSearchParams(window.location.search);
const uid = params.get('uid') || '';
const token = params.get('token') || '';

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

if (!uid || !token) {
    resetError.textContent = '重置链接无效，请重新发起找回密码';
}

resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetError.textContent = '';
    resetError.style.color = 'var(--danger)';

    if (!uid || !token) {
        resetError.textContent = '重置链接无效，请重新发起找回密码';
        return;
    }

    const password = String(newPassword.value || '');
    const passwordConfirm = String(newPasswordConfirm.value || '');

    if (!password || !passwordConfirm) {
        resetError.textContent = '请完整填写新密码';
        return;
    }

    const { baseUrl, passwordMinLength } = getAuthConfig();
    const passwordMessage = validateStrongPassword(password, passwordMinLength);
    if (passwordMessage) {
        resetError.textContent = passwordMessage;
        return;
    }

    if (password !== passwordConfirm) {
        resetError.textContent = '两次输入的密码不一致';
        return;
    }

    try {
        if (resetSubmitButton) resetSubmitButton.disabled = true;
        const response = await window.__nativeFetch(`${baseUrl}/password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid,
                token,
                new_password: password,
                new_password_confirm: passwordConfirm
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            throw new Error((data && data.detail) ? data.detail : `重置失败(${response.status})`);
        }

        resetError.style.color = '#1b9a59';
        resetError.textContent = (data && data.detail) ? data.detail : '密码重置成功';
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1200);
    } catch (e) {
        resetError.textContent = e && e.message ? e.message : '重置失败';
    } finally {
        if (resetSubmitButton) resetSubmitButton.disabled = false;
    }
});
