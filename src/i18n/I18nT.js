// <I18nT k="setup.step1"><template #dashboard><a …>…</a></template></I18nT>
// Renders a translation and swaps {name} placeholders for the matching slot,
// so sentences with links or emphasis stay whole in each language.

import { Fragment, h } from 'vue'
import { t } from './index'

export default {
  name: 'I18nT',
  props: {
    k: { type: String, required: true },
    params: { type: Object, default: () => ({}) },
  },
  setup(props, { slots }) {
    return () => {
      const parts = t(props.k, props.params).split(/(\{\w+\})/)
      const children = parts.map((part) => {
        const slot = /^\{(\w+)\}$/.exec(part)?.[1]
        return slot && slots[slot] ? slots[slot]() : part
      })
      return h(Fragment, children)
    }
  },
}
