import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onResetApp?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleRecover = () => {
    this.setState({ hasError: false });
    if (this.props.onResetApp) {
      this.props.onResetApp();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto my-12 max-w-lg rounded-2xl border border-[#E6E1D6] bg-white p-6 sm:p-8 text-center shadow-xs"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF3F1] text-[#C83E2B]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg sm:text-xl font-bold text-[#1C1917]">
            表示中に一時的なエラーが発生しました
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#57534E] leading-relaxed">
            ページの再読み込み、またはトップ画面への復帰をお試しください。
          </p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={this.handleRecover}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C83E2B] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              トップ画面へ復帰する
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
