<script setup lang="ts">
/// <reference types="pouchdb-core" />
import { ref } from 'vue';
import PouchDB from 'pouchdb-browser';
import { usePouchRef } from 'vue3-pouch';
import slug from 'slug';

type Column = {
  type: "column",
  label: string,
  slug: string
}

type Item = {
  type: "item",
  name: string,
  description: string,
  category: string,
  done: boolean
}

type Database = Item | Column

const database = new PouchDB<Database>("todo-list-cdl")

database.sync(import.meta.env.VITE_COUCH_URL, {
  live: true,
  retry: true
})

const columns = usePouchRef<Column, Database>({
  selector: {
    type: "column"
  }
}, database).content

const items = usePouchRef<Item, Database>({
  selector: {
    type: "item"
  }
}, database).content



const catForm = ref<string>("")

async function addColumn() {
  try {
    await database.post<Column>({
      type: "column",
      label: catForm.value,
      slug: slug(catForm.value)
    })
    catForm.value = ""
  }
  catch (e) {
    console.error(e)
  }
}

async function addItem() {
  try {
    await database.post<Item>({
      type: "item",
      name: itemForm.value.name,
      description: itemForm.value.description,
      category: itemForm.value.category,
      done: false
    })
    itemForm.value = {
      name: "",
      description: "",
      category: ""
    }
  }
  catch (e) {
    console.error(e)
  }
}

async function deleteCol(col: PouchDB.Core.ExistingDocument<Column>) {
  try {

    await database.remove(col)
  }
  catch (e) {
    console.error(e)
  }
}

async function deleteItem(item: PouchDB.Core.ExistingDocument<Item>) {
  try {

    await database.remove(item)
  }
  catch (e) {
    console.error(e)
  }
}
const itemForm = ref({
  name: "",
  description: "",
  category: ""
})

async function changeDone(st: boolean, { done, ...item }: PouchDB.Core.ExistingDocument<Item>) {
  await database.put({
    ...item,
    done: st
  })
}
</script>

<template>
  <div id="home">
    <div class="columns">
      <div class="column" v-for="col in columns" :key="col._id">
        <div class="col_header">
          {{ col.label }}

          <button @click="deleteCol(col)">Supprimer</button>
        </div>
        <div class="col_items">
          <div class="item" v-if="items" v-for="item in items.filter((i) => {
            return i.category === col.slug
          })" :key="item._id" :class="{
            'bg_green': item.done,
            'bg_red': !item.done
          }">
            {{ item.done }}
            <button @click="deleteItem(item)">Supprimer</button>
            <label for="m">Marquer comme fait<input type="checkbox"
                @change="(v) => changeDone((v.target as HTMLInputElement).checked, item)" /></label>
            <p>{{ item.name }}</p>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="form">
          <label for="n">Créer une colonne</label>
          <input type="text" v-model="catForm" name="n" id="n" />
          <button @click="addColumn()">Créer la colonne {{ catForm }}</button>
        </div>

        <div class="form">
          <p>Créer un item</p>
          <input type="text" v-model="itemForm.name" name="n" id="n" placeholder="Nom" />
          <input type="text" v-model="itemForm.description" name="d" id="d" placeholder="Description" />
          <select v-model="itemForm.category">
            <option value="" selected disabled>Catégorie</option>
            <option v-for="col in columns" :key="col._id" :value="col.slug">
              {{ col.label }}
            </option>
          </select>
          <button @click="addItem()">Créer la colonne {{ itemForm.name }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.column {
  background-color: #95a5a6;
  flex: 1;
  padding: 0.5em;
}

.col_items {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.columns {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.item {
  background-color: #bdc3c7;
  border-radius: 0.5em;
}

.bg_green {
  background-color: #27ae60;
}

.bg_red {
  background-color: #c0392b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
