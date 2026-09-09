import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Portal encountered an error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('durniti_theme');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="font-serif-bn font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
              দুর্নীতির বিরুদ্ধে নিউজ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              পৃষ্ঠাটি লোড হতে সমস্যা হয়েছে। দয়া করে রিফ্রেশ করুন।
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
            >
              পুনরায় লোড করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
