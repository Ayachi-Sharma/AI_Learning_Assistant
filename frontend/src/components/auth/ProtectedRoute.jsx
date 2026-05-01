import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute() {
  const {isAuthenticated, loading} = useAuth()

    if(loading){
        return <><div> <p> Loading... </p> </div></>
    }
    return isAuthenticated ? ( 
        <AppLayout>
            <Outlet/>
        </AppLayout>
  ) : (
    <Navigate to="/login" replace/>
  );
}

export default ProtectedRoute