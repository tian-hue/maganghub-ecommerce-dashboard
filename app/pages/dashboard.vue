<script setup lang="ts">
import {
  ArrowUpRight,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Search,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const router = useRouter();

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  lowStockProducts: 0,
});
const recentOrders = ref<any[]>([]);
const isLoading = ref(true);
const error = ref("");

onMounted(async () => {
  const user = await auth.fetchUser();
  if (!user) {
    await router.replace("/login");
    return;
  }

  try {
    const response = await $fetch("/api/dashboard");
    stats.value = response.stats;
    recentOrders.value = response.recentOrders;
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to load dashboard.";
  } finally {
    isLoading.value = false;
  }
});

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const orderCount = computed(() => recentOrders.value.length);

const statCards = computed(() => [
  {
    label: "Total Products",
    value: stats.value.totalProducts,
    icon: Package,
    accent: "bg-blue-100 text-blue-700",
  },
  {
    label: "Total Orders",
    value: stats.value.totalOrders,
    icon: ShoppingCart,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    label: "Revenue",
    value: formatRupiah(stats.value.totalRevenue),
    icon: DollarSign,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Low Stock",
    value: stats.value.lowStockProducts,
    icon: AlertTriangle,
    accent: "bg-amber-100 text-amber-700",
  },
]);
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-brand-600">Overview</p>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
      >
        {{ auth.user.value?.role }} Access
      </div>
    </div>

    <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-28 animate-pulse rounded-2xl bg-slate-200"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
    >
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div :class="['rounded-xl p-3', card.accent]">
              <component :is="card.icon" class="h-5 w-5" />
            </div>
            <ArrowUpRight class="h-4 w-4 text-slate-400" />
          </div>
          <p class="mt-4 text-sm text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ card.value }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Recent orders</h2>
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            <Search class="h-4 w-4" />
            {{ orderCount }} items
          </button>
        </div>

        <div
          v-if="recentOrders.length === 0"
          class="rounded-xl bg-slate-50 p-6 text-center text-slate-500"
        >
          No recent orders yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500">
                <th class="py-3 pr-4 font-medium">Order</th>
                <th class="py-3 pr-4 font-medium">Customer</th>
                <th class="py-3 pr-4 font-medium">Date</th>
                <th class="py-3 pr-4 font-medium">Total</th>
                <th class="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="border-b border-slate-100 last:border-0"
              >
                <td class="py-3 pr-4 font-medium text-slate-800">
                  {{ order.orderNumber }}
                </td>
                <td class="py-3 pr-4 text-slate-600">
                  {{ order.customerName }}
                </td>
                <td class="py-3 pr-4 text-slate-600">
                  {{ new Date(order.orderDate).toLocaleDateString("id-ID") }}
                </td>
                <td class="py-3 pr-4 font-medium text-slate-800">
                  {{ formatRupiah(order.total) }}
                </td>
                <td class="py-3 pr-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="statusClasses(order.status)"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    statusClasses(status: string) {
      const map: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700",
        processing: "bg-blue-100 text-blue-700",
        completed: "bg-emerald-100 text-emerald-700",
        cancelled: "bg-rose-100 text-rose-700",
      };

      return map[status] || "bg-slate-100 text-slate-700";
    },
  },
};
</script>
