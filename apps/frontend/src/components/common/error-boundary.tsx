import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(): void {}
  render() { return this.state.hasError ? <main className="p-6">Something went wrong.</main> : this.props.children; }
}
