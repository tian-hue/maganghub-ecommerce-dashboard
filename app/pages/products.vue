<script setup lang="ts">
import { Plus, Pencil, Trash2, Search } from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const router = useRouter();
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const search = ref("");
const selectedCategory = ref("");
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const isLoading = ref(true);
const error = ref("");
const formMode = ref<"create" | "edit">("create");
const productForm = ref({
  id: "",
  name: "",
  description: "",
  categoryId: "",
  price: 0,
  stock: 0,
});
const showForm = ref(false);

const canManageProducts = computed(() => auth.user.value?.role === "ADMIN");

async function loadData() {
  isLoading.value = true;
  try {
    const [productResponse, categoryResponse] = await Promise.all([
      $fetch("/api/products", {
        query: {
          search: search.value || undefined,
          category: selectedCategory.value || undefined,
          page: page.value,
          limit: limit.value,
        },
      }),
      $fetch("/api/categories"),
    ]);

    products.value = productResponse.products;
    totalPages.value = productResponse.totalPages;
    categories.value = categoryResponse.categories;
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to load products.";
  } finally {
    isLoading.value = false;
  }
}

async function openCreateModal() {
  formMode.value = "create";
  productForm.value = {
    id: "",
    name: "",
    description: "",
    categoryId: categories.value[0]?.id || "",
    price: 0,
    stock: 0,
  };
  showForm.value = true;
}

async function openEditModal(product: any) {
  formMode.value = "edit";
  productForm.value = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    categoryId: product.categoryId,
    price: product.price,
    stock: product.stock,
  };
  showForm.value = true;
}

async function saveProduct() {
  if (!productForm.value.categoryId) {
    error.value = "Category is required.";
    return;
  }

  try {
    if (formMode.value === "create") {
      await $fetch("/api/products", {
        method: "POST",
        body: {
          name: productForm.value.name,
          description: productForm.value.description,
          categoryId: productForm.value.categoryId,
          price: Number(productForm.value.price),
          stock: Number(productForm.value.stock),
        },
      });
    } else {
      await $fetch(`/api/products/${productForm.value.id}`, {
        method: "PUT",
        body: {
          name: productForm.value.name,
          description: productForm.value.description,
          categoryId: productForm.value.categoryId,
          price: Number(productForm.value.price),
          stock: Number(productForm.value.stock),
        },
      });
    }

    showForm.value = false;
    await loadData();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to save product.";
  }
}

async function deleteProduct(id: string) {
  if (!confirm("Delete this product?")) return;

  try {
    await $fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadData();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || "Unable to delete product.";
  }
}

onMounted(async () => {
  const user = await auth.fetchUser();
  if (!user) {
    await router.replace("/login");
    return;
  }
  await loadData();
});

watch([search, selectedCategory], () => {
  page.value = 1;
  loadData();
});
watch(page, () => {
  loadData();
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
    <div
      class="flex flex-col justify-between gap-3 md:flex-row md:items-center"
    >
      <div>
        <p class="text-sm font-medium text-brand-600">Catalog</p>
        <h1 class="text-2xl font-bold text-slate-900">Products</h1>
      </div>

      <button
        v-if="canManageProducts"
        @click="openCreateModal"
        class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white"
      >
        <Plus class="h-4 w-4" />
        New product
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            v-model="search"
            placeholder="Search products"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All categories</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
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
              <th class="px-4 py-3 font-medium">Product</th>
              <th class="px-4 py-3 font-medium">Category</th>
              <th class="px-4 py-3 font-medium">Price</th>
              <th class="px-4 py-3 font-medium">Stock</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th v-if="canManageProducts" class="px-4 py-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in products"
              :key="product.id"
              class="border-t border-slate-200"
            >
              <td class="px-4 py-3">
                <div>
                  <p class="font-semibold text-slate-900">{{ product.name }}</p>
                  <p class="text-xs text-slate-500">
                    {{ product.description || "No description" }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ product.categoryName }}
              </td>
              <td class="px-4 py-3 font-medium text-slate-800">
                {{ formatRupiah(product.price) }}
              </td>
              <td class="px-4 py-3 text-slate-700">{{ product.stock }}</td>
              <td class="px-4 py-3">
                <span
                  :class="
                    product.stock < 5
                      ? 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700'
                      : 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700'
                  "
                >
                  {{ product.stock < 5 ? "Low stock" : "In stock" }}
                </span>
              </td>
              <td v-if="canManageProducts" class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(product)"
                    class="rounded-lg bg-slate-100 p-2 text-slate-700"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteProduct(product.id)"
                    class="rounded-lg bg-red-50 p-2 text-red-600"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex items-center justify-between border-t border-slate-200 p-4"
      >
        <button
          :disabled="page === 1"
          @click="page -= 1"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span class="text-sm text-slate-600"
          >Page {{ page }} / {{ totalPages }}</span
        >
        <button
          :disabled="page >= totalPages"
          @click="page += 1"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
    >
      <div class="w-full max-w-lg rounded-3xl bg-white p-5 shadow-soft">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ formMode === "create" ? "Add product" : "Edit product" }}
          </h2>
          <button @click="showForm = false" class="text-slate-400">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium">Product name</label>
            <input
              v-model="productForm.name"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Description</label>
            <textarea
              v-model="productForm.description"
              rows="3"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            ></textarea>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">Category</label>
              <select
                v-model="productForm.categoryId"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <option value="">Select category</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Price</label>
              <input
                v-model.number="productForm.price"
                type="number"
                min="1"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Stock</label>
            <input
              v-model.number="productForm.stock"
              type="number"
              min="0"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            />
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-3">
          <button
            @click="showForm = false"
            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            @click="saveProduct"
            class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
