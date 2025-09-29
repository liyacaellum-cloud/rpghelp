// auth-simple-fixed.js - SISTEMA CORRIGIDO
class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('rpgUsers')) || [];
        this.init();
    }

    init() {
        // Criar admin se não existir
        if (!this.users.find(u => u.username === 'admin')) {
            this.users.push({
                id: 'admin_001',
                username: 'admin',
                password: 'admin123', // Senha visível apenas para desenvolvimento
                email: 'admin@rpg.com',
                profile: {
                    avatar: '👑',
                    bio: 'Mestre do RPG',
                    favoriteClass: 'Mestre',
                    joinDate: new Date().toISOString()
                },
                isAdmin: true,
                characters: [],
                notes: [],
                friends: [],
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('rpgUsers', JSON.stringify(this.users));
            console.log('✅ Usuário admin criado: admin / admin123');
        }
        
        this.checkLoginStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }

    register() {
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        console.log('Tentativa de registro:', { username, email });

        // Validações básicas
        if (!username || !email || !password) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('As senhas não coincidem!', 'error');
            return;
        }

        if (password.length < 3) {
            this.showNotification('Senha muito curta! Mínimo 3 caracteres.', 'error');
            return;
        }

        // Verificar se usuário já existe
        if (this.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            this.showNotification('Nome de usuário já existe! Escolha outro.', 'error');
            return;
        }

        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showNotification('Email já cadastrado!', 'error');
            return;
        }

        // Criar novo usuário
        const newUser = {
            id: 'user_' + Date.now(),
            username,
            email,
            password: password,
            profile: {
                avatar: '😊',
                bio: 'Novo aventureiro!',
                favoriteClass: '',
                joinDate: new Date().toISOString(),
                color: this.getRandomColor()
            },
            isAdmin: false,
            characters: [],
            notes: [],
            friends: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('rpgUsers', JSON.stringify(this.users));
        
        console.log('✅ Novo usuário registrado:', newUser);
        this.showNotification(`🎉 Bem-vindo, ${username}! Conta criada com sucesso!`, 'success');
        
        // Fazer login automaticamente
        this.currentUser = newUser;
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        console.log('Tentativa de login:', username);

        const user = this.users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Login bem-sucedido:', user.username);
            this.showNotification(`🎮 E aí, ${user.username}! Bem-vindo de volta!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.log('❌ Login falhou para:', username);
            this.showNotification('❌ Usuário ou senha incorretos!', 'error');
        }
    }

    logout() {
        console.log('👋 Logout:', this.currentUser?.username);
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.showNotification('Até mais! Volte logo!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }

    checkLoginStatus() {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.updateUIForLoggedInUser();
                console.log('✅ Usuário já logado:', this.currentUser.username);
            }
        } catch (e) {
            console.error('Erro ao verificar login:', e);
            sessionStorage.removeItem('currentUser');
        }
    }

    updateUIForLoggedInUser() {
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection) authSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'flex';
            const avatarEl = document.getElementById('user-avatar');
            const usernameEl = document.getElementById('username-display');
            const badgeEl = document.getElementById('user-badge');
            
            if (avatarEl) avatarEl.textContent = this.currentUser.profile.avatar;
            if (usernameEl) usernameEl.textContent = this.currentUser.username;
            
            if (badgeEl) {
                if (this.currentUser.isAdmin) {
                    badgeEl.textContent = 'Mestre';
                    badgeEl.style.background = '#ffd700';
                    badgeEl.style.color = '#000';
                } else {
                    badgeEl.textContent = 'Aventureiro';
                }
            }
        }
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showNotification(message, type = 'success') {
        // Remover notificações existentes
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4ecdc4'};
            color: white;
            padding: 16px 24px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            font-size: 16px;
            max-width: 400px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    switchToLogin() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab && loginForm && registerForm) {
            registerTab.classList.remove('active');
            loginTab.classList.add('active');
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }

    switchToRegister() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    // Função para debug - listar usuários no console
    debugUsers() {
        console.log('📊 Usuários no sistema:', this.users);
    }
}

// Inicializar auth
const auth = new SimpleAuth();

// Função global para debug
window.debugAuth = () => {
    auth.debugUsers();
    console.log('👤 Usuário atual:', auth.currentUser);
    console.log('💾 LocalStorage users:', localStorage.getItem('rpgUsers'));
};