<script setup>
import { onMounted, provide, reactive, ref, watch } from "vue";
import axios from "axios";

import CardList from "./components/CardList.vue";
import Drawer from "./components/Drawer.vue";
import Header from "./components/Header.vue";

const items = ref([]);

const filters = reactive({
  sortBy: "title",
  searchQuerry: "",
});

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value;
};
const onChangeSearchInput = (event) => {
  filters.searchQuerry = event.target.value;
};

const fetchFavorites = async () => {
  try {
    const { data: favorites } = await axios.get(
      `https://9e47f1eaf145057c.mokky.dev/favorites`
    );

    items.value = items.value.map((item) => {
      const favorite = favorites.find(
        (favorite) => favorite.parentId === item.id
      );

      if (!favorite) {
        return item;
      }
      return {
        ...item,
        isFavorite: true,
        favoriteId: favorite.parentId,
      };
    });
  } catch (err) {
    console.err(err);
  }
};

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        parentId: item.id,
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
    console.err(e);
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
    console.err(err);
  }
};

onMounted(async () => {
  await fetchItems();
  await fetchFavorites();
});

watch(filters, fetchItems);
</script>

<template>
  <!-- <Drawer /> -->
  <div class="bg-white w-4/5 m-auto rounded-xl shadow-xl mt-14">
    <Header />
    <div class="p-10">
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
        <CardList :items="items" @addToFavorite="addToFavorite" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
