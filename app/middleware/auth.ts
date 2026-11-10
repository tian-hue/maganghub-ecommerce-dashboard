import { useAuth } from "../composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  const user = await auth.fetchUser();

  if (!user) {
    return navigateTo("/login");
  }
});
