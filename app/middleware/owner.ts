export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const session = useOwnerSession()
  const allowed = await session.ensureOwner()
  if (allowed) return

  return navigateTo({
    path: '/login',
    query: { redirect: to.fullPath },
  })
})
