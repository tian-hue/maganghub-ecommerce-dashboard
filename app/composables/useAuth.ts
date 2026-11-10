export const useAuth = () => {
  const user = useState<{
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
  } | null>("auth-user", () => null);

  const loading = ref(false);

  const fetchUser = async () => {
    try {
      const response = await $fetch("/api/auth/me", { method: "GET" });
      user.value = response.user;
      return response.user;
    } catch (error) {
      user.value = null;
      return null;
    }
  };

  const login = async (payload: { email: string; password: string }) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: payload,
      });
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
      user.value = null;
      await navigateTo("/login");
    } finally {
      loading.value = false;
    }
  };

  return { user, loading, fetchUser, login, logout };
};
