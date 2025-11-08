import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * Public route wrapper for authentication pages.
 * If user is already authenticated (has a token), redirects to appropriate dashboard based on role.
 * Otherwise, renders child routes via <Outlet />.
 */
export default function PublicRoutes() {
	// read token and user from zustand store (persisted to localStorage)
	const { token, user } = useAuthStore.getState();

	if (token) {
		// User is already logged in, redirect to appropriate dashboard based on role
		if (user?.role === 'admin') {
			return <Navigate to="/admin/dashboard" replace />;
		}
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}

