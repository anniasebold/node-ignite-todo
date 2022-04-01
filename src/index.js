const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userByUsername = users.find((user) => user.username === username)

  if(!userByUsername) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = userByUsername;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const verifyUsernameExists = users.some((user) => user.username === username)

  if (verifyUsernameExists) {
    return response.status(400).send({ error: 'Username already exists' })
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/users', (request, response) => {
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title, 
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const [todoById] = user.todos.filter((todo) => todo.id === id);

  todoById.title = title;
  todoById.deadline = new Date(deadline);

  return response.json(todoById)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const [todoById] = user.todos.filter((todo) => todo.id === id);

  todoById.done = true;

  return response.json(todoById)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodoById = user.todos.findIndex((todo) => todo.id === id);

  console.log(indexTodoById)

  user.todos.splice(indexTodoById, 1)

  return response.sendStatus(204);
});

app.listen(3333);