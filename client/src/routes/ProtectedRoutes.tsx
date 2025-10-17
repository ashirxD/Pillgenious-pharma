import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

/**
 * Simple protected route wrapper.
 * Checks for an `authToken` in localStorage. If present, renders child routes via <Outlet />.
 * Otherwise redirects to the login page at '/'.
 */
export default function ProtectedRoutes() {
	// You can swap this for a more robust auth check (context, redux, etc.)
	const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

	if (!token) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
