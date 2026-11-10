<script setup lang="ts">
import { Eye } from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const router = useRouter();
const orders = ref<any[]>([]);
const statusFilter = ref("");
const isLoading = ref(true);
const error = ref("");

const canManageOrders = computed(() => auth.user.value?.role === "ADMIN");

async function loadOrders() {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/orders", {
      query: statusFilter.value ? { status: statusFilter.value } : {},
    });
    orders.value = response.orders;
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to load orders.";
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(orderId: string, value: string) {
  if (!canManageOrders.value) return;
  try {
    await $fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status: value },
    });
    await loadOrders();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to update order status.";
  }
}

onMounted(async () => {
  const user = await auth.fetchUser();
  if (!user) {
    await router.replace("/login");
    return;
  }
  await loadOrders();
});

watch(statusFilter, () => loadOrders());

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const statusClasses = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
};
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-brand-600">Transactions</p>
        <h1 class="text-2xl font-bold text-slate-900">Orders</h1>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <select
          v-model="statusFilter"
          class="bg-transparent text-sm text-slate-700 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div
      v-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
    >
      {{ error }}
    </div>

    <div
      v-if="isLoading"
      class="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div class="h-10 animate-pulse rounded-xl bg-slate-200"></div>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Order #</th>
              <th class="px-4 py-3 font-medium">Customer</th>
              <th class="px-4 py-3 font-medium">Date</th>
              <th class="px-4 py-3 font-medium">Total</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="border-t border-slate-200"
            >
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ order.orderNumber }}
              </td>
              <td class="px-4 py-3 text-slate-700">{{ order.customerName }}</td>
              <td class="px-4 py-3 text-slate-600">
                {{ new Date(order.orderDate).toLocaleDateString("id-ID") }}
              </td>
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ formatRupiah(order.total) }}
              </td>
              <td class="px-4 py-3">
                <template v-if="canManageOrders">
                  <select
                    :value="order.status"
                    @change="
                      updateStatus(
                        order.id,
                        ($event.target as HTMLSelectElement).value,
                      )
                    "
                    class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </template>
                <span
                  v-else
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusClasses(order.status)"
                  >{{ order.status }}</span
                >
              </td>
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/orders/${order.id}`"
                  class="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-700"
                >
                  <Eye class="h-4 w-4" />
                  Details
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
