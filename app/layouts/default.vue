<script setup lang="ts">
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

const route = useRoute();
const auth = useAuth();
const sidebarOpen = ref(false);

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/products", icon: ShoppingBag },
  { label: "Orders", to: "/orders", icon: ClipboardList },
];

const handleLogout = async () => {
  await auth.logout();
};

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  },
);

const currentUser = computed(() => auth.user.value);
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800">
    <div class="flex min-h-screen">
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white shadow-soft transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ]"
      >
        <div
          class="flex h-16 items-center justify-between border-b border-slate-200 px-5"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600"
            >
              MagangHub
            </p>
            <h1 class="text-lg font-bold text-slate-900">E-Commerce</h1>
          </div>
          <button class="md:hidden" @click="sidebarOpen = false">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-6 p-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              Logged in as
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ currentUser?.name || "User" }}
            </p>
            <p class="text-sm text-slate-600">
              {{ currentUser?.role || "STAFF" }}
            </p>
          </div>

          <nav class="space-y-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.label"
              :to="item.to"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              active-class="bg-brand-50 text-brand-700"
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>

          <button
            class="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div class="flex min-h-screen flex-1 flex-col">
        <header
          class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm"
        >
          <div class="flex h-16 items-center justify-between px-4 md:px-6">
            <button class="md:hidden" @click="sidebarOpen = true">
              <Menu class="h-5 w-5 text-slate-700" />
            </button>
            <div class="hidden md:block" />
            <div class="ml-auto flex items-center gap-3">
              <div
                class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700"
              >
                {{ currentUser?.role || "STAFF" }}
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 p-4 md:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
