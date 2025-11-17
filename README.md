# MyList - Todo List Application

A comprehensive, feature-rich todo list web application with user authentication, built with Node.js, Express, and vanilla JavaScript.

## Features

### Authentication
- User registration with username, email, and password
- Secure login/logout functionality
- Session-based authentication
- Password hashing with bcrypt

### Todo Management
- **Add Todos**: Create new tasks with detailed information
- **Edit Todos**: Update task details anytime
- **Delete Todos**: Remove individual tasks
- **Mark Complete**: Toggle completion status
- **Clear Completed**: Bulk delete all completed tasks

### Advanced Features
- **Categories**: Organize todos by category (General, Work, Personal, Shopping, Health, Education)
- **Priorities**: Set priority levels (High, Medium, Low) with visual indicators
- **Due Dates**: Add due dates with overdue warnings
- **Tags**: Add multiple tags to categorize and search todos
- **Search**: Real-time search across todo text, categories, and tags
- **Filtering**: View all, active, or completed todos
- **Sorting**: Sort by newest, oldest, priority, due date, or alphabetically
- **Statistics**: View total, active, and completed task counts

### User Interface
- Modern, responsive design
- Beautiful gradient login page
- Intuitive user interface
- Color-coded priority indicators
- Empty state messages
- Modal dialogs for editing
- Smooth animations and transitions

## Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Register a new account or login with existing credentials

## Project Structure

```
TODO_List/
├── server.js          # Express server and API routes
├── package.json       # Node.js dependencies
├── README.md         # This file
├── data/             # Data storage (auto-created)
│   ├── users.json    # User accounts
│   └── todos.json    # Todo items
└── public/           # Frontend files
    ├── login.html    # Login/Register page
    ├── app.html      # Main application page
    ├── styles.css    # All styling
    ├── auth.js       # Authentication logic
    └── app.js        # Todo application logic
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Todos
- `GET /api/todos` - Get all todos for current user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `DELETE /api/todos` - Clear all completed todos

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Todos**: Enter task details in the form at the top
3. **Manage Todos**: 
   - Click checkbox to mark complete/incomplete
   - Click "Edit" to modify a todo
   - Click "Delete" to remove a todo
4. **Filter & Search**: Use the filter buttons and search bar to find specific todos
5. **Sort**: Use the sort dropdown to organize your todos
6. **Clear Completed**: Remove all completed tasks at once

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Express Sessions, bcrypt
- **Storage**: JSON files (easily upgradeable to database)

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Input validation
- XSS protection (HTML escaping)
- Secure session cookies

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- Email notifications for due dates
- Recurring todos
- Todo sharing and collaboration
- Dark mode
- Drag and drop reordering
- Export/Import functionality
- Mobile app

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

