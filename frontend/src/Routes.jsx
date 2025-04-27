import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login';
import Powercast from './pages/Powercast';
import Optimizer from './pages/Optimizer';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path = '/' element = {<Home />}/>
      <Route path = '/dashboard' element = {<Dashboard />}/>
      <Route path = '/powercast' element = {<Powercast />}/>
      <Route path = '/optimizer' element = {<Optimizer />}/>
      <Route path = '/login' element = {<Login />}/>
    </Routes>
  );
};

export default AppRoutes;