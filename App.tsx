
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const App: React.FC = () => {
  return (
    <div className="min-h-screen theme-transition text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-primary)] selection:text-[var(--accent-text)] overflow-hidden">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
