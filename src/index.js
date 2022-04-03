const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

users = [];

function checkIfValidUUID(str) {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userByUsername = users.find((user) => user.username === username)

  if(!userByUsername) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = userByUsername;

  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const { user } = request;

  if (user.todos.length < 10 || user.pro === true) {
    return next();
  }

  return response.status(403).json({ error: "Limit of 10 TODOS registered exceeded update your plan" })
}

function checksTodoExists(request, response, next) {
  const { user } = request;
  const { id } = request.params;
  
  if(checkIfValidUUID(id) === false) {
    return response.status(400).json({ error: "TODO uuid is invalid uuid" })
  }
  
  const checkTodo = checkTodoById(id, user);

  if(!checkTodo) {
    return response.status(404).json({ error: "TODO not exists in user informed" })
  }

  return next();
}

function checkTodoById(id, user) {
  const [todoById] = user.todos.filter((todo) => todo.id === id);

  return todoById;
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
    todos: [],
    pro: false
  }

  users.push(user)

  return response.status(201).json(user);
});

app.patch('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { name, pro } = request.body;

  if (name) {
    user.name = name;
  }
  
  user.pro = pro;

  const userUpdated = users.filter((userUpdated) => userUpdated.username = user.username)
  
  return response.status(201).json(userUpdated);

})

app.get('/users', (request, response) => {
  return response.json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {
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

app.put('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = checkTodoById(id, user);

  if(!todo) {
    return response.status(404).json({ error: "TODO not found" })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  const todoUpdated = checkTodoById(id, user);

  return response.json(todoUpdated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = checkTodoById(id, user);

  if(!todo) {
    return response.status(404).json({ error: "TODO not found" })
  }

  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodoById = user.todos.findIndex((todo) => todo.id === id);

  if(indexTodoById < 0) {
    return response.status(404).json({ error: "TODO not found" })
  }

  console.log(indexTodoById)

  user.todos.splice(indexTodoById, 1)

  return response.sendStatus(204);
});

app.listen(3333);