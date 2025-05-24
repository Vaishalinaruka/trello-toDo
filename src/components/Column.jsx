import React from 'react';

const Column = React.memo(({ title, children, onDrop, onDragOver, onDragLeave, isDragOver }) => {
  return (
    <div
      className={`flex flex-col gap-4 h-fit text-center bg-white/80 min-w-[340px] max-w-[400px] rounded-2xl shadow-lg p-5 border border-slate-200 backdrop-blur-md hover:shadow-2xl transition ${isDragOver ? 'ring-4 ring-blue-300 border-blue-400' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      aria-dropeffect="move"
      tabIndex={0}
    >
      <h2 className="text-xl font-bold text-slate-700 mb-2 tracking-wide uppercase letter-spacing-2">{title}</h2>
      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
});

export default Column;
