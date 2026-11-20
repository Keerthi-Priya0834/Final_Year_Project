import { redirect } from '@tanstack/react-router'
import { useAppStore } from '../store/useAppStore'

export function requireResult() {
  if (!useAppStore.getState().result) {
    throw redirect({ to: '/' })
  }
}
