import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useAuthGuard(): () => boolean {
  const { isAuthenticated, isRestoring } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(() => {
    if (isAuthenticated) return true
    if (isRestoring) return false

    showToast('Щоб виконати цю дію, увійдіть в акаунт.', 'info')
    navigate('/login', {
      state: { from: `${location.pathname}${location.search}` },
    })
    return false
  }, [isAuthenticated, isRestoring, showToast, navigate, location])
}
