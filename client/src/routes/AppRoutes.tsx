import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';
import Loader from '../components/Loader';

const AuthApp = lazy(() => import('../pages/auth/AuthApp'));
const AdminLogin = lazy(() => import('../pages/auth/AdminLogin'));
		
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const Checkout = lazy(() => import('../pages/Checkout'));

// Minimal Error Boundary
class ErrorBoundary extends React.Component {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: any) {
		// You can send error to logging service here
		// console.error(error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 20 }}>
					<h2>Something went wrong.</h2>
					<p>Please refresh the page or contact support.</p>
				</div>
			);
		}

		// @ts-ignore
		return this.props.children;
	}
}

export default function AppRoutes() {
	return (
		<ErrorBoundary>
			<Suspense fallback={<Loader />}>
						<Routes>
						<Route element={<PublicRoutes />}>
							  <Route path="/" element={<AuthApp />} />
							  <Route path="/signup" element={<AuthApp initialPage="signup" />} />
							  <Route path="/admin-login" element={<AdminLogin />} />
						</Route>

						{/* Protected routes group */}
						<Route element={<ProtectedRoutes />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/admin/dashboard" element={<AdminDashboard />} />
							<Route path="/checkout" element={<Checkout />} />
						</Route>

						{/* Catch-all -> if user hits unknown route, redirect to root */}
						<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
			</Suspense>
		</ErrorBoundary>
	);
}
