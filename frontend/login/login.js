const form = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const error = document.getElementById('error');
const visual = document.querySelector('.visual');
const scene = document.querySelector('.scene');
const characters = Array.from(document.querySelectorAll('.character'));
const registerButton = document.getElementById('btn-register');
const submitButton = form ? form.querySelector('button[type="submit"]') : null;
const faceMap = new Map();
const eyeMap = new Map();
let gazeMode = 'pointer';
let motionFrameId = 0;
let pendingPointerEvent = null;
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

characters.forEach((character) => {
    faceMap.set(character, character.querySelector('.face'));
    eyeMap.set(character, Array.from(character.querySelectorAll('.eye')));
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const depthOf = (character) => {
    if (character.classList.contains('yellow')) return 1.35;
    if (character.classList.contains('black')) return 1.2;
    if (character.classList.contains('purple')) return 1;
    return 0.85;
};

const applyMotion = (nx, ny) => {
    scene.style.setProperty('--scene-ry', `${nx * 4}deg`);
    scene.style.setProperty('--scene-rx', `${-ny * 3.5}deg`);

    characters.forEach((character) => {
        const depth = depthOf(character);
        const face = faceMap.get(character);
        const eyes = eyeMap.get(character);
        const headX = nx * 5 * depth;
        const headY = ny * 4 * depth;
        const headR = nx * 6 * depth;
        const eyeX = nx * 4.2 * depth;
        const eyeY = ny * 3.4 * depth;

        face.style.setProperty('--head-x', `${headX}px`);
        face.style.setProperty('--head-y', `${headY}px`);
        face.style.setProperty('--head-r', `${headR}deg`);

        eyes.forEach((eye) => {
            eye.style.setProperty('--eye-x', `${eyeX}px`);
            eye.style.setProperty('--eye-y', `${eyeY}px`);
        });
    });
};
const updateMotion = (clientX, clientY) => {
    const rect = visual.getBoundingClientRect();
    const nx = clamp((clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    const ny = clamp((clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    applyMotion(nx, ny);
};

const gazeTowardElement = (target, reverse = false) => {
    const sceneRect = scene.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sceneCx = sceneRect.left + sceneRect.width / 2;
    const sceneCy = sceneRect.top + sceneRect.height / 2;
    const targetCx = targetRect.left + targetRect.width / 2;
    const targetCy = targetRect.top + targetRect.height / 2;
    let nx = clamp((targetCx - sceneCx) / (window.innerWidth * 0.45), -1, 1);
    let ny = clamp((targetCy - sceneCy) / (window.innerHeight * 0.45), -1, 1);
    if (reverse) {
        nx = -nx;
        ny = -ny;
    }
    applyMotion(nx, ny);
};

const resetMotion = () => {
    scene.style.setProperty('--scene-ry', '0deg');
    scene.style.setProperty('--scene-rx', '0deg');
    characters.forEach((character) => {
        faceMap.get(character).style.setProperty('--head-x', '0px');
        faceMap.get(character).style.setProperty('--head-y', '0px');
        faceMap.get(character).style.setProperty('--head-r', '0deg');
        eyeMap.get(character).forEach((eye) => {
            eye.style.setProperty('--eye-x', '0px');
            eye.style.setProperty('--eye-y', '0px');
        });
    });
};

const flushPointerMotion = () => {
    motionFrameId = 0;
    if (!pendingPointerEvent || gazeMode !== 'pointer') {
        return;
    }
    updateMotion(pendingPointerEvent.clientX, pendingPointerEvent.clientY);
    pendingPointerEvent = null;
};

const schedulePointerMotion = (event) => {
    if (prefersReducedMotion || gazeMode !== 'pointer') return;
    pendingPointerEvent = event;
    if (!motionFrameId) {
        motionFrameId = window.requestAnimationFrame(flushPointerMotion);
    }
};

visual.addEventListener('pointermove', schedulePointerMotion, { passive: true });

visual.addEventListener('pointerleave', () => {
    pendingPointerEvent = null;
    if (motionFrameId) {
        window.cancelAnimationFrame(motionFrameId);
        motionFrameId = 0;
    }
    if (gazeMode === 'pointer') resetMotion();
});

username.addEventListener('focus', () => {
    gazeMode = 'username';
    gazeTowardElement(username, false);
});

password.addEventListener('focus', () => {
    gazeMode = 'password';
    gazeTowardElement(password, true);
});
username.addEventListener('input', () => {
    if (gazeMode === 'username') gazeTowardElement(username, false);
});

password.addEventListener('input', () => {
    if (gazeMode === 'password') gazeTowardElement(password, true);
});

username.addEventListener('blur', () => {
    if (document.activeElement !== password) {
        gazeMode = 'pointer';
        resetMotion();
    }
});

password.addEventListener('blur', () => {
    if (document.activeElement !== username) {
        gazeMode = 'pointer';
        resetMotion();
    }
});

window.addEventListener('load', async () => {
    if (prefersReducedMotion) {
        resetMotion();
    }
    const params = new URLSearchParams(window.location.search);
    const presetUsername = params.get('username');
    if (presetUsername) {
        username.value = presetUsername;
        password.focus();
    }
});

if (registerButton) {
    registerButton.addEventListener('click', () => {
        redirectToRegister();
    });
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    error.style.color = 'var(--danger)';
    username.style.borderColor = '';
    password.style.borderColor = '';

    if (!username.value.trim() || !password.value.trim()) {
        error.textContent = '请输入完整的账号和密码';
        if (!username.value.trim()) username.style.borderColor = 'var(--danger)';
        if (!password.value.trim()) password.style.borderColor = 'var(--danger)';
        return;
    }
    try {
        if (submitButton) submitButton.disabled = true;
        await loginByPassword(username.value.trim(), password.value);
        error.style.color = '#1b9a59';
        error.textContent = '登录成功，正在进入系统...';
        redirectToDashboard();
    } catch (e) {
        error.textContent = e && e.message ? e.message : '登录失败';
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});
