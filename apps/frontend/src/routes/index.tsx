import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';

const Placeholder = ({ title }: { title: string }) => <main className="p-6"><h1 className="text-2xl font-semibold">{title}</h1></main>;

export const router = createBrowserRouter([
  { path: '/login', element: <Placeholder title="Library Management System" /> },
  { path: '/forbidden', element: <Placeholder title="Access denied" /> },
  { element: <ProtectedRoute />, children: [{ path: '/', element: <Placeholder title="Dashboard" /> }] },
]);
