<script setup lang="ts">
import { useAuth } from "../../composables/useAuth";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const order = ref<any>(null);
const isLoading = ref(true);
const error = ref("");

onMounted(async () => {
  const user = await auth.fetchUser();
  if (!user) {
    await router.replace("/login");
    return;
  }

  try {
    order.value = await $fetch(`/api/orders/${route.params.id}`);
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to load order.";
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
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-brand-600">Order detail</p>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ order?.orderNumber || "Order details" }}
        </h1>
      </div>
      <NuxtLink
        to="/orders"
        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >Back to orders</NuxtLink
      >
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
      Loading...
    </div>

    <div v-else-if="order" class="space-y-5">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-sm text-slate-500">Customer</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ order.customerName }}
            </p>
            <p class="text-sm text-slate-600">{{ order.customerEmail }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Date</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ new Date(order.orderDate).toLocaleString("id-ID") }}
            </p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Status</p>
            <span
              class="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
              >{{ order.status }}</span
            >
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 font-medium text-slate-600">Product</th>
                <th class="px-4 py-3 font-medium text-slate-600">Quantity</th>
                <th class="px-4 py-3 font-medium text-slate-600">Unit Price</th>
                <th class="px-4 py-3 font-medium text-slate-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in order.items"
                :key="item.id"
                class="border-t border-slate-200"
              >
                <td class="px-4 py-3 font-medium text-slate-800">
                  {{ item.productNameSnapshot }}
                </td>
                <td class="px-4 py-3 text-slate-700">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-slate-700">
                  {{ formatRupiah(item.unitPrice) }}
                </td>
                <td class="px-4 py-3 font-medium text-slate-900">
                  {{ formatRupiah(item.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="border-t border-slate-200 p-4 text-right text-lg font-bold text-slate-900"
        >
          Total: {{ formatRupiah(order.total) }}
        </div>
      </div>
    </div>
  </div>
</template>
