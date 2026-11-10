<script setup lang="ts">
import { useAuth } from "../composables/useAuth";

definePageMeta({
  layout: false,
});

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const email = ref("admin@example.com");
const password = ref("AdminDemo123!");
const error = ref("");

const redirectTo = computed(() => {
  const target = route.query.redirect as string | undefined;
  return target || "/dashboard";
});

onMounted(async () => {
  const user = await auth.fetchUser();
  if (user) {
    await router.replace("/dashboard");
  }
});

async function submit() {
  error.value = "";

  try {
    await auth.login({ email: email.value, password: password.value });
    await router.replace(redirectTo.value);
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Login failed.";
  }
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10"
  >
    <div
      class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8"
    >
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
        >
          <span class="text-xl font-bold">M</span>
        </div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600"
        >
          MagangHub
        </p>
        <h1 class="mt-3 text-3xl font-bold text-slate-900">Sign in</h1>
        <p class="mt-2 text-sm text-slate-500">
          Access the administration dashboard
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          {{ auth.loading.value ? "Signing in..." : "Log in" }}
        </button>
      </form>

      <div class="mt-6 grid gap-2 text-sm text-slate-600">
        <p>Demo admin: admin@example.com / AdminDemo123!</p>
        <p>Demo staff: staff@example.com / StaffDemo123!</p>
      </div>
    </div>
  </div>
</template>
