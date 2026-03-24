import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    const state = (this as any).state;
    if (state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (state.error?.message) {
          const parsed = JSON.parse(state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Database Error: ${parsed.error}`;
            if (parsed.error.includes('insufficient permissions')) {
              errorMessage = "Security Error: You don't have permission to perform this action.";
            }
          }
        }
      } catch (e) {
        // Not a JSON error message, use the raw message
        errorMessage = state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-swiss-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full border-4 border-swiss-black p-8 md:p-12 space-y-8 bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-6">
              <div className="bg-swiss-red p-4 border-2 border-swiss-black">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                SYSTEM<br />ERROR.
              </h1>
            </div>

            <div className="space-y-4">
              <p className="swiss-label text-swiss-red font-black">Error Details:</p>
              <div className="p-6 bg-gray-100 border-2 border-swiss-black font-mono text-sm break-all">
                {errorMessage}
              </div>
              {isFirestoreError && (
                <p className="text-sm font-medium uppercase tracking-tight text-gray-500">
                  This error has been logged for technical review.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="swiss-button flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="swiss-label">Reload App</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="swiss-button bg-swiss-white text-swiss-black border-2 border-swiss-black hover:bg-gray-100 flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                <span className="swiss-label">Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;



