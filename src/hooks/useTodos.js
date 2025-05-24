// Custom hook for managing todos
import { useState } from 'react';

export function useTodos(initialTodos = []) {
  const [todos, setTodos] = useState(initialTodos);

  const addTodo = (todo) => setTodos([...todos, todo]);
  const removeTodo = (id) => setTodos(todos.filter(t => t.id !== id));
  const updateTodo = (id, updated) => setTodos(todos.map(t => t.id === id ? { ...t, ...updated } : t));

  return { todos, setTodos, addTodo, removeTodo, updateTodo };
}
