/*
 * @Author: lifenglei 1125911451@qq.com
 * @Date: 2025-12-26 21:19:36
 * @LastEditors: lifenglei 1125911451@qq.com
 * @LastEditTime: 2025-12-27 10:30:09
 * @FilePath: /fluentStep/index.tsx
 * @Description: 
 * 
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// 添加所有Solid图标到库中
library.add(fas);

// FontAwesome已配置完成，可以在组件中直接使用

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
