const computedBehavior = require('miniprogram-computed')
import {isArray} from '../../utils/pmed'

Component({
  options: {
    virtualHost: true
  },
  behaviors: [computedBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: null
    },
    tags: {
      type: Array
    },
    multiple: {
      type: Boolean,
      value: false
    },
    style: { 
      type: String,
    }
  },

  externalClasses: ['class', 'tag-class'],

  /**
   * 组件的初始数据
   */
  data: {

  },

  computed: {
    richTags(data) {
      return data.tags ? data.tags.map(tag => {
        return Object.assign({}, tag, {
          selected: isArray(data.value) ? data.value.indexOf(tag.value) !== -1 : data.value === tag.value
        })
      }) : []
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTagClick(e) {
      const tag = e.currentTarget.dataset.tag
      let newValue
      if (this.data.multiple) {
        newValue = this.data.value ? [...this.data.value]:[]
        if (tag.selected) {
          newValue.splice(newValue.indexOf(tag.value), 1)
        } else {
          newValue.push(tag.value)
        }
        if (newValue.length===0){
          newValue = null
        }
      } else {
        if (tag.selected) {
          newValue = null
        } else {
          newValue = tag.value
        }
      }
      this.triggerEvent('input', newValue)
    }
  }
})