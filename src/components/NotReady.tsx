import { locales } from '../locales'

interface Props {
  isError: boolean
  onRetry: () => void
}

export const NotReady = ({ isError, onRetry }: Props) => {
  return (
    <div className="screen center">
      <div className="not-ready">
        <span className="not-ready__icon">⚠</span>
        <p className="not-ready__text">
          {isError ? locales.errors.accessError : locales.errors.notReady}
        </p>
        <button className="btn btn--ghost" onClick={onRetry}>
          {locales.errors.retryButtonLabel}
        </button>
      </div>
    </div>
  )
}
