<script setup>
import { inject, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import CardList from "../components/CardList.vue";
import debounce from "lodash.debounce";

const { cart, addToCart, removeFromCart } = inject("cart");

const items = ref([]);

const filters = reactive({
  sortBy: "title",
  searchQuerry: "",
});

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item);
  } else {
    removeFromCart(item);
  }
};

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value;
};

const onChangeSearchInput = debounce((event) => {
  filters.searchQuerry = event.target.value;
}, 500);

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id,
      };

      item.isFavorite = true;

      const { data } = await axios.post(
        `https://9e47f1eaf145057c.mokky.dev/favorites`,
        obj
      );

      item.favoriteId = data.id;
    } else {
      item.isFavorite = false;
      await axios.delete(
        `https://9e47f1eaf145057c.mokky.dev/favorites/${item.favoriteId}`
      );
      item.favoriteId = null;
    }
  } catch (e) {
    console.log(e);
  }
};

const fetchFavorites = async () => {
  try {
    const { data: favorites } = await axios.get(
      `https://9e47f1eaf145057c.mokky.dev/favorites`
    );

    items.value = items.value.map((item) => {
      const favorite = favorites.find(
        (favorite) => favorite.item_id === item.id
      );

      if (!favorite) {
        return item;
      }
      return {
        ...item,
        isFavorite: true,
        favoriteId: favorite.id,
      };
    });
  } catch (err) {
    console.log(err);
  }
};

const fetchItems = async () => {
  try {
    const params = {
      sortBy: filters.sortBy,
    };

    if (filters.searchQuerry) {
      params.title = `*${filters.searchQuerry}*`;
    }

    const { data } = await axios.get(
      `https://9e47f1eaf145057c.mokky.dev/items`,
      { params }
    );

    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoriteId: null,
      isAdded: false,
    }));
  } catch (err) {
    console.log(err);
  }
};

onMounted(async () => {
  const localCart = localStorage.getItem("cart");

  try {
    if (!localCart || localCart.trim() === "") {
      cart.value = [];
    } else {
      cart.value = JSON.parse(localCart);
      if (!Array.isArray(cart.value)) {
        console.warn("Данные не являются массивом");
        cart.value = [];
      }
    }
  } catch (e) {
    console.log(e);
    cart.value = [];
  }

  await fetchItems();
  await fetchFavorites();
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id),
  }));
});

watch(cart, () => {
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: false,
  }));
});

watch(filters, fetchItems);
</script>

<template>
  <div class="flex justify-between items-center">
    <h2 class="text-3xl font-bold mb-8">Все кроссовки</h2>

    <div class="flex justify-between gap-4">
      <select
        @change="onChangeSelect"
        class="py-2 px-3 border rounded-md outline-none bg-transparent"
      >
        <option value="name">По названию</option>
        <option value="price">По цене (дешевые)</option>
        <option value="-price">По цене (дорогие)</option>
      </select>

      <div class="relative">
        <img class="absolute left-4 top-3" src="/search.svg" alt="Search" />
        <input
          @input="onChangeSearchInput"
          class="border border-gray-200 rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400"
          type="text"
          placeholder="Поиск..."
        />
      </div>
    </div>
  </div>
  <div class="mt-10">
    <CardList
      :items="items"
      @add-to-favorite="addToFavorite"
      @add-to-cart="onClickAddPlus"
    />
  </div>
</template>
