// Home page for the Trello-styled todo board
import React, { Suspense } from 'react';
const Board = React.lazy(() => import('../components/Board'));

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen  p-6 bg-gradient-to-br from-blue-50 to-slate-200 items-center justify-center">
      <h1 className="text-center text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-slate-600 drop-shadow mb-4">
        Todoist
      </h1>
      <p className="text-center text-lg text-slate-500 max-w-2xl mb-8">
        A minimal, creative, and Kanban-styled Todo Board. Organize your day with simplicity and style.
      </p>
      <Suspense fallback={<div>Loading board...</div>}>
        <Board />
      </Suspense>
    </div>
  );
};

export default Home;
