import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Home from './components/Home';
import Learning from './components/Learning';
import Summary from './components/Summary';
import Mistakes from './components/Mistakes';
import CheckInPage from './components/CheckInPage';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// 创建路由配置
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ThemeProvider>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/learning/:scenarioId',
        element: <Learning />,
      },
      {
        path: '/summary',
        element: <Summary />,
      },
      {
        path: '/mistakes',
        element: <Mistakes />,
      },
      {
        path: '/check-in',
        element: <CheckInPage onBack={() => window.history.back()} />,
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <ThemeProvider>
        <AuthProvider>
          <AuthForm />
        </AuthProvider>
      </ThemeProvider>
    ),
  },
];

// 创建浏览器路由
export const router = createBrowserRouter(routes);
