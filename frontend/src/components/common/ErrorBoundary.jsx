import { Component } from 'react';
import { t } from '../../i18n';
import { Button } from './Button';
import { EmptyState } from './PageState';

/** Shows a friendly message instead of a blank page if rendering throws. */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container">
        <EmptyState
          icon="alert"
          title={t('errors.crashTitle')}
          description={t('errors.crashBody')}
          action={<Button onClick={() => window.location.reload()}>{t('errors.reload')}</Button>}
        />
      </div>
    );
  }
}
