// auth-simple.js
class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('rpgUsers')) || [];
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        
        // Criar usuário admin padrão se não existir
        if (!this.users.find(u => u.username === 'admin')) {
            this.users.push({
                id: 'admin_001',
                username: 'admin',
                password: 'admin123', // Senha em texto puro mesmo
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
                friends: []
            });
            localStorage.setItem('rpgUsers', JSON.stringify(this.users));
        }
    }

    setupEventListeners() {
        // Login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Logout
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }

    register() {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        // Verificar se usuário já existe
        if (this.users.find(u => u.username === username)) {
            this.showNotification('Nome de usuário já existe! Escolha outro.', 'error');
            return;
        }

        // Criar novo usuário
        const newUser = {
            id: 'user_' + Date.now(),
            username,
            email,
            password: password, // Texto puro mesmo
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

        this.showNotification(`Bem-vindo, ${username}! Conta criada com sucesso!`, 'success');
        this.switchToLogin();
    }

    login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const user = this.users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.showNotification(`E aí, ${user.username}! Bem-vindo de volta!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            this.showNotification('Usuário ou senha incorretos!', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.showNotification('Até mais! Volte logo!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }

    checkLoginStatus() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }

    updateUIForLoggedInUser() {
        // Atualizar interface para usuário logado
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection) authSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'flex';
            document.getElementById('user-avatar').textContent = this.currentUser.profile.avatar;
            document.getElementById('username-display').textContent = this.currentUser.username;
            
            if (this.currentUser.isAdmin) {
                document.getElementById('user-badge').textContent = 'Mestre';
                document.getElementById('user-badge').style.background = '#ffd700';
                document.getElementById('user-badge').style.color = '#000';
            }
        }
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showNotification(message, type = 'success') {
        // Sistema de notificação simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4ecdc4'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    switchToLogin() {
        document.getElementById('register-tab').classList.remove('active');
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }

    switchToRegister() {
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('register-tab').classList.add('active');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }
}

// Inicializar auth
const auth = new SimpleAuth();