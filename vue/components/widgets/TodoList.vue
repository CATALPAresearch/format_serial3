<template>
  <div class="py-3">
    <h3 class="heading-underline pb-1">
      <i class="fa fa-sticky-note-o mr-2" aria-hidden="true"></i>
      To-Do Liste
    </h3>
    <div class="py-2">
      <ul v-for="(item, index) in reversedItems" :key="index" class="p-0">
        <li class="checkbox-items" :data-status="item.completed">
          <div class="d-flex">
            <input type="checkbox" :data-id="item.id" :id="item.id" @click="toggleItem(item)" :checked="item.completed" class="mr-2"/>
            <label :class="{'item-completed': item.completed}" class="m-0" :data-id="item.id" :for="item.id" >{{ item.name }}</label>
          </div>
          <button type="button" class="close" aria-label="Deletes item" :data-id="item.id" @click="deleteItem(item)">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      </ul>
    </div>
    <div>
      <div class="input-group control-group">
        <input v-model="newItem" @keyup.enter="addItem" type="text" class="form-control" :placeholder="placeholderAddItem"  />
        <button type="submit" class="btn btn-primary" @click="addItem" :disabled="newItem.length === 0">
<!--          <i class="fa fa-plus" aria-hidden="true"></i>-->
          Add item
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import {get_string} from 'core/str';


export default {
  name: "TodoList",

  data() {
    return {
      items: [
        {
          id: 1,
          name: 'KE1 lesen',
          completed: false,
        },
        {
          id: 2,
          name: 'Selbsttestaufgabe 1 lösen',
          completed: true,
        },
      ],
      newItem: '',
      placeholderAddItem: 'Neues Item hinzufügen..',
    }
  },
  props: {
    location: String
  },

  computed: {
    reversedItems() {
      return this.items.slice(0).reverse();
    },
  },

  methods: {
    toggleItem (item) {
      item.completed = !item.completed
    },

    deleteItem(item) {
      this.items = this.items.filter((newItem) => newItem.name !== item.name);
    },

    addItem () {
      this.items.push({
        id: this.items.length + 1,
        name: this.newItem,
        completed: false,
      });
      this.newItem = '';
    },
  }
}
</script>

<style lang="scss" scoped>
.checkbox-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-completed {
  text-decoration: line-through;
}

.heading-underline {
  border-bottom: 1px solid #dee2e6;
}
</style>