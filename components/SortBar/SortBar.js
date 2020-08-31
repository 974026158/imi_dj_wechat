// components/SortBar/SortBar.js
const computedBehavior = require('miniprogram-computed')
Component({
  behaviors: [computedBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: null
    },
    fields: {
      type: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  computed: {
    computedFields (data) {
      return data.fields?data.fields.map(item => {
        return {
          name: item.name,
          label: item.label,
          selected: data.value && data.value.field === item.name
        }
      }):[]
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleField (e) {
      const field = e.currentTarget.dataset.field
      if (this.data.value && this.data.value.field === field.name) {
        return
      }
      this.triggerEvent('input', {field: field.name, direction: 'DESC'})
    }
  }
})
