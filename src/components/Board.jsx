import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Button from './common/Button';
import { useTodos } from '../hooks/useTodos';
import { addTodoApi, getTodosApi, updateTodoApi, deleteTodoApi } from '../api/routes';

const Column = React.lazy(() => import('./Column'));
const TodoCard = React.lazy(() => import('./TodoCard'));

const COLUMN_TYPES = [
  { key: 'pending', label: 'Pending' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const Board = React.memo(() => {
  const [newTodo, setNewTodo] = useState('');
  const [draggedTodo, setDraggedTodo] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loadingTodos, setLoadingTodos] = useState({});
  const [creating, setCreating] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { todos, setTodos, addTodo, updateTodo, removeTodo } = useTodos([]);

  // Fetch todos on mount
  useEffect(() => {
    setFetching(true);
    getTodosApi().then(({ todos }) => {
      setTodos(
        todos.map((todo) => ({
          ...todo,
          text: todo.todo,
          status: todo.completed ? 'completed' : 'pending',
        }))
      );
      setFetching(false);
    });
  }, [setTodos]);

  // Add todo
  const handleAddTodo = useCallback(async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setCreating(true);
    const res = await addTodoApi(newTodo);
    if (res && res.id) {
      addTodo({
        id: res.id,
        text: res.todo,
        status: 'pending',
      });
      setNewTodo('');
    }
    setCreating(false);
  }, [newTodo, addTodo]);

  // Edit todo
  const handleEditTodo = useCallback((todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  }, []);

  const handleEditChange = useCallback((e) => {
    setEditText(e.target.value);
  }, []);

  const handleEditSave = useCallback(async (todo) => {
    setLoadingTodos((prev) => ({ ...prev, [todo.id]: 'editing' }));
    const res = await updateTodoApi(todo.id, { todo: editText });
    if (res && res.updatedTodo) {
      updateTodo(todo.id, { text: editText });
      setEditId(null);
      setEditText('');
    }
    setLoadingTodos((prev) => {
      const { [todo.id]: _, ...rest } = prev;
      return rest;
    });
  }, [editText, updateTodo]);

  // Delete todo
  const handleDeleteTodo = useCallback(async (todo) => {
    setLoadingTodos((prev) => ({ ...prev, [todo.id]: 'deleting' }));
    const res = await deleteTodoApi(todo.id);
    if (res && res.updatedTodo) {
      removeTodo(todo.id);
    }
    setLoadingTodos((prev) => {
      const { [todo.id]: _, ...rest } = prev;
      return rest;
    });
  }, [removeTodo]);

  // Drag and drop
  const handleDragStart = useCallback((todo) => {
    setDraggedTodo(todo);
  }, []);

  const handleDragOver = useCallback((colKey, idx) => {
    setDragOverCol(colKey);
    setDragOverIdx(idx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
    setDragOverIdx(null);
  }, []);

  const handleDrop = useCallback(async (colKey, idx) => {
    if (!draggedTodo) return;
    // Remove from old position
    let filtered = todos.filter(t => t.id !== draggedTodo.id);
    // Insert at new position
    const newTodo = { ...draggedTodo, status: colKey };
    filtered.splice(idx, 0, newTodo);
    setTodos(filtered);
    setDragOverCol(null);
    setDragOverIdx(null);
    setDraggedTodo(null);
    // Optionally update status in backend
    setLoadingTodos((prev) => ({ ...prev, [draggedTodo.id]: 'updating' }));
    let updateObj = {};
    if (colKey === 'completed') updateObj.completed = true;
    if (colKey === 'pending') updateObj.completed = false;
    if (colKey === 'inprogress') updateObj.completed = false;
    await updateTodoApi(draggedTodo.id, updateObj);
    setLoadingTodos((prev) => {
      const { [draggedTodo.id]: _, ...rest } = prev;
      return rest;
    });
  }, [draggedTodo, todos, setTodos]);

  return (
    <div className="flex bg-gradient-to-br from-slate-100 to-slate-300 gap-10 overflow-x-auto p-5 min-h-[80vh] rounded-2xl shadow-xl">
      <Suspense fallback={<div>Loading columns...</div>}>
        {COLUMN_TYPES.map((col) => {
          const colTodos = todos.filter(t => t.status === col.key);
          return (
            <Column
              key={col.key}
              title={col.label}
              onDrop={e => {
                e.preventDefault();
                handleDrop(col.key, dragOverIdx !== null ? dragOverIdx : colTodos.length);
              }}
              onDragOver={e => {
                e.preventDefault();
                // If not over a card, set to end of column
                if (e.target.classList.contains('column')) {
                  handleDragOver(col.key, colTodos.length);
                }
              }}
              onDragLeave={handleDragLeave}
              isDragOver={dragOverCol === col.key}
            >
              {col.key === 'pending' && (
                <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    placeholder="Add a todo..."
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-slate-700 shadow"
                    disabled={creating}
                    maxLength={60}
                  />
                  <Button type="submit" disabled={creating} className="bg-blue-500  hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow transition">{creating ? 'Adding...' : 'Add'}</Button>
                </form>
              )}
              {fetching && col.key === 'pending' && <div className="text-center text-slate-400">Loading todos...</div>}
              {colTodos.map((todo, idx) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={() => handleDragStart(todo)}
                  onDragOver={e => {
                    e.preventDefault();
                    handleDragOver(col.key, idx);
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    handleDrop(col.key, idx);
                  }}
                  onDragEnd={handleDragLeave}
                  className={`w-full ${dragOverCol === col.key && dragOverIdx === idx ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ cursor: 'grab', marginBottom: 8 }}
                >
                  {editId === todo.id ? (
                    <div className="todo-card flex flex-col gap-2 bg-white rounded-lg p-4 shadow border border-slate-200">
                      <input
                        type="text"
                        value={editText}
                        onChange={handleEditChange}
                        className="rounded-md border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        maxLength={60}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition" onClick={() => handleEditSave(todo)} disabled={loadingTodos[todo.id] === 'editing'}>{loadingTodos[todo.id] === 'editing' ? 'Saving...' : 'Save'}</Button>
                        <Button className="bg-gray-300 hover:bg-gray-400 text-slate-700 px-3 py-1 rounded transition" onClick={() => setEditId(null)} disabled={loadingTodos[todo.id] === 'editing'}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    // Card: show action buttons only on hover, but reserve space to prevent layout shift
                    <TodoCard todo={todo}>
                      <div className="relative h-6 flex items-center justify-end mt-2">
                        {/* The invisible buttons reserve space so height doesn't change on hover */}
                        <span className="inline-block w-[56px] h-6 opacity-0 pointer-events-none">
                          <Button className="w-[28px] h-6 px-0" />
                          <Button className="w-[28px] h-6 px-0" />
                        </span>
                        {/* The visible buttons appear on hover, absolutely positioned over the reserved space */}
                        <span className="absolute right-0 top-0 flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                          <Button className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-white px-2 py-1 rounded transition text-xs w-[40px] h-6" onClick={() => handleEditTodo(todo)} disabled={loadingTodos[todo.id] === 'editing'}>Edit</Button>
                          <Button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-2 py-1 rounded transition text-xs w-fit h-6" onClick={() => handleDeleteTodo(todo)} disabled={loadingTodos[todo.id] === 'deleting'}>{loadingTodos[todo.id] === 'deleting' ? '...' : 'Del'}</Button>
                        </span>
                        {/* Show moving indicator if updating */}
                        {loadingTodos[todo.id] === 'updating' && <span className="ml-2 text-xs text-blue-400 animate-pulse">Moving...</span>}
                      </div>
                    </TodoCard>
                  )}
                </div>
              ))}
            </Column>
          );
        })}
      </Suspense>
    </div>
  );
});

export default Board;

// Comments for complex logic:
// - handleDrop: Handles dropping a todo at a specific index in a column, updating both UI and backend.
// - handleDragOver: Tracks which column and index the dragged item is over, for precise drop placement.
// - loadingTodos: Object keyed by todo id, tracks per-todo loading state for update/delete/edit/move.
// - The action buttons are always present but only visible on hover, so card height never changes.
