<script lang="ts">
import { defineComponent  } from 'vue';
const API_URL = 'http://localhost:3001';
export default defineComponent({
  data: () => ({
    authors: null
  }),
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const url = `${API_URL}/authors`;
      this.authors = await (await fetch(url)).json();
    }
  }
});
</script>

<template>
  <h1>Authors</h1> 
  <ul>
    <li v-for="author in authors" :key="author.id">
      {{ author.name }}
    </li>
  </ul>
</template>