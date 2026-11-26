import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError, getErrorMessage, normalizeError } from '../api/errors'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { authSchema } from '../schemas/authSchema'
import type { AuthFormData } from '../schemas/authSchema'
import './LoginPage.scss'

const DEFAULT_REDIRECT = '/tasks'

/** Адреса, з якої користувача відправили на Login (кладе ProtectedRoute / useAuthGuard). */
function getReturnPath(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    state.from.startsWith('/') &&
    !state.from.startsWith('//')
  ) {
    return state.from
  }
  return DEFAULT_REDIRECT
}

function getLoginErrorMessage(error: ApiError): string {
  if (error.kind === 'http' && (error.status === 400 || error.status === 401)) {
    return 'Невірний логін або пароль.'
  }
  return getErrorMessage(error)
}

function LoginPage() {
  const { isAuthenticated, isRestoring, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: '', password: '' },
  })

  useDocumentTitle('Study Planner — вхід')

  const returnPath = getReturnPath(location.state)

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to={returnPath} replace />
  }

  const onSubmit = async (data: AuthFormData) => {
    setSubmitError(null)
    try {
      await login(data)
      showToast('Вхід виконано')
      navigate(returnPath, { replace: true })
    } catch (cause) {
      setSubmitError(getLoginErrorMessage(normalizeError(cause)))
    }
  }

  return (
    <section className="login" aria-label="Вхід">
      <h2 className="login__title">Вхід</h2>
      <p className="login__hint">
        Тестовий акаунт DummyJSON: <code>emilys</code> / <code>emilyspass</code>
      </p>

      <form className="login__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="login__field">
          <label className="login__label" htmlFor="login-username">
            Логін
          </label>
          <input
            id="login-username"
            className={
              errors.username ? 'login__input login__input--invalid' : 'login__input'
            }
            type="text"
            autoComplete="username"
            disabled={isSubmitting || isRestoring}
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? 'login-username-error' : undefined}
            {...register('username')}
          />
          {errors.username && (
            <p className="login__error" id="login-username-error" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            className={
              errors.password ? 'login__input login__input--invalid' : 'login__input'
            }
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting || isRestoring}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p className="login__error" id="login-password-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {submitError && (
          <p className="login__error login__error--form" role="alert">
            {submitError}
          </p>
        )}

        <button
          className="login__submit"
          type="submit"
          disabled={isSubmitting || isRestoring}
        >
          {isSubmitting ? 'Вхід…' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
