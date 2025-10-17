import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
	import useAuthStore from '../store/useAuthStore';

/**
 * Simple protected route wrapper.
 * Checks for an `authToken` in localStorage. If present, renders child routes via <Outlet />.
 * Otherwise redirects to the login page at '/'.
 */
export default function ProtectedRoutes() {
	// read token from zustand store (persisted to localStorage)
	// use getState() to avoid implicit-any selector typing in this TS file
	const token = useAuthStore.getState().token;

	if (!token) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
