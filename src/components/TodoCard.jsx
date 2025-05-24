// TodoCard component for individual todo items
import React from 'react';

const TodoCard = React.memo(({ todo, children, className }) => {
  return (
    <div className={`todo-card flex flex-col gap-2 bg-white rounded-lg p-4 shadow border border-slate-200 hover:shadow-lg transition group ${className}`}>
      <p className="text-base text-slate-700 font-medium break-words group-hover:text-blue-500 transition">{todo.text}</p>
      <div className="flex gap-2 mt-2 justify-end">{children}</div>
    </div>
  );
});

export default TodoCard;
