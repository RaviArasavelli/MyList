const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mylist-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Data storage files
const USERS_FILE = 'data/users.json';
const TODOS_FILE = 'data/todos.json';

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Initialize data files if they don't exist
function initDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(TODOS_FILE)) {
    fs.writeFileSync(TODOS_FILE, JSON.stringify({}, null, 2));
  }
}

initDataFiles();

// Helper functions
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readTodos() {
  try {
    const data = fs.readFileSync(TODOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function writeTodos(todos) {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes
app.get('/', (req, res) => {
  // Serve index.html which will handle routing
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app.html', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
  } else {
    res.redirect('/login.html');
  }
});

app.get('/login.html', (req, res) => {
  if (req.session.userId) {
    res.redirect('/app.html');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

app.get('/csv-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'csv-dashboard.html'));
});

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = readUsers();
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  req.session.userId = newUser.id;
  res.json({ success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username || u.email === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/user', requireAuth, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.session.userId);
  
  if (user) {
    res.json({ id: user.id, username: user.username, email: user.email });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Todo routes
app.get('/api/todos', requireAuth, (req, res) => {
  const todos = readTodos();
  const userTodos = todos[req.session.userId] || [];
  res.json(userTodos);
});

app.post('/api/todos', requireAuth, (req, res) => {
  const { text, category, priority, dueDate, tags } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const todos = readTodos();
  if (!todos[req.session.userId]) {
    todos[req.session.userId] = [];
  }

  const newTodo = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    category: category || 'General',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  todos[req.session.userId].push(newTodo);
  writeTodos(todos);

  res.json(newTodo);
});

app.put('/api/todos/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { text, completed, category, priority, dueDate, tags } = req.body;

  const todos = readTodos();
  if (!todos[req.session.userId]) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const todoIndex = todos[req.session.userId].findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const todo = todos[req.session.userId][todoIndex];
  
  if (text !== undefined) todo.text = text.trim();
  if (completed !== undefined) todo.completed = completed;
  if (category !== undefined) todo.category = category;
  if (priority !== undefined) todo.priority = priority;
  if (dueDate !== undefined) todo.dueDate = dueDate;
  if (tags !== undefined) todo.tags = tags;
  todo.updatedAt = new Date().toISOString();

  writeTodos(todos);
  res.json(todo);
});

app.delete('/api/todos/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  const todos = readTodos();
  if (!todos[req.session.userId]) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const todoIndex = todos[req.session.userId].findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[req.session.userId].splice(todoIndex, 1);
  writeTodos(todos);

  res.json({ success: true });
});

app.delete('/api/todos', requireAuth, (req, res) => {
  const todos = readTodos();
  if (todos[req.session.userId]) {
    todos[req.session.userId] = todos[req.session.userId].filter(t => !t.completed);
    writeTodos(todos);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

