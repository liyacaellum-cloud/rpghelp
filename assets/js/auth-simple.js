// auth-system-fixed.js - SISTEMA 100% FUNCIONAL
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('rpgUsers')) || [];
        console.log('🔧 Sistema de Auth iniciado. Usuários:', this.users);
        this.init();
    }

    init() {
        // Criar admin padrão se não existir
        if (!this.users.find(u => u.username === 'admin')) {
            this.createDefaultAdmin();
        }
        
        this.checkLoginStatus();
        this.setupEventListeners();
    }

    createDefaultAdmin() {
        const adminUser = {
            id: 'admin_001',
            username: 'admin',
            password: 'admin123',
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
        };
        this.users.push(adminUser);
        localStorage.setItem('rpgUsers', JSON.stringify(this.users));
        console.log('✅ Admin criado: admin / admin123');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulário de login submetido');
                this.login();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulário de registro submetido');
                this.register();
            });
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });

        // Tabs de login/registro
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        if (loginTab) loginTab.addEventListener('click', () => this.switchToLogin());
        if (registerTab) registerTab.addEventListener('click', () => this.switchToRegister());
    }

    register() {
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        console.log('🔄 Tentando registrar:', { username, email });

        // Validações
        if (!username || !email || !password) {
            this.showNotification('❌ Preencha todos os campos!', 'error');
            return;
        }

        if (password.length < 3) {
            this.showNotification('❌ Senha muito curta! Mínimo 3 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('❌ As senhas não coincidem!', 'error');
            return;
        }

        // Verificar se usuário já existe
        if (this.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            this.showNotification('❌ Nome de usuário já existe!', 'error');
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
        this.showNotification(`🎉 Bem-vindo, ${username}! Login automático...`, 'success');
        
        // Login automático
        this.currentUser = newUser;
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        console.log('🔄 Tentando login:', username);

        // Encontrar usuário
        const user = this.users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Login bem-sucedido:', user.username);
            this.showNotification(`🎮 Bem-vindo, ${user.username}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.log('❌ Login falhou');
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
                console.log('✅ Usuário logado:', this.currentUser.username);
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
            document.getElementById('user-avatar').textContent = this.currentUser.profile.avatar;
            document.getElementById('username-display').textContent = this.currentUser.username;
            
            const badge = document.getElementById('user-badge');
            if (badge) {
                if (this.currentUser.isAdmin) {
                    badge.textContent = 'Mestre';
                    badge.style.background = '#ffd700';
                    badge.style.color = '#000';
                } else {
                    badge.textContent = 'Aventureiro';
                }
            }
        }
    }

    switchToLogin() {
        console.log('🔁 Mudando para login');
        document.getElementById('register-tab').classList.remove('active');
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }

    switchToRegister() {
        console.log('🔁 Mudando para registro');
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('register-tab').classList.add('active');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showNotification(message, type = 'success') {
        // Remover notificações antigas
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            font-size: 16px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Debug
    debug() {
        console.log('🔍 DEBUG:');
        console.log('Usuários:', this.users);
        console.log('Usuário atual:', this.currentUser);
        console.log('LocalStorage:', localStorage.getItem('rpgUsers'));
    }
}

// Inicializar sistema
const auth = new AuthSystem();

// Funções globais para debug
window.debugAuth = () => auth.debug();
window.resetAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
};