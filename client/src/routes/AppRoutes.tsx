import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';

// Lazy-loaded pages
// AuthApp (auth UI) moved to its own file
const AuthApp = lazy(() => import('../pages/auth/AuthApp'));
// A simple placeholder for protected area (Dashboard)
const Dashboard = lazy(() => import('../pages/Dashboard'));

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
			<Suspense fallback={<div>Loading...</div>}>
						<Routes>
							  {/* Use the auth app as the root route */}
							  <Route path="/" element={<AuthApp />} />
							  {/* Route to open the auth app directly on signup view */}
							  <Route path="/signup" element={<AuthApp initialPage="signup" />} />

							{/* Protected routes group */}
							<Route element={<ProtectedRoutes />}>
								<Route path="/dashboard" element={<Dashboard />} />
							</Route>

							{/* Catch-all -> if user hits unknown route, redirect to root */}
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
			</Suspense>
		</ErrorBoundary>
	);
}
