<script setup lang="ts">
import {
  getArchiveThemeOption,
  type ArchiveThemeId,
} from '~/utils/archive-theme'

const selector = ref<HTMLDetailsElement | null>(null)
const { theme, themes, setTheme } = useArchiveTheme()

// 交由 Unhead 维护，防止静态 head 在水合后覆盖浏览器地址栏颜色。
useHead(() => ({
  meta: [{
    name: 'theme-color',
    content: getArchiveThemeOption(theme.value).canvas,
  }],
}))

function selectTheme(themeId: ArchiveThemeId): void {
  setTheme(themeId)
  selector.value?.removeAttribute('open')
}

function closeSelector(): void {
  selector.value?.removeAttribute('open')
}
</script>

<template>
  <details
    ref="selector"
    class="archive-theme-selector"
    @keydown.esc="closeSelector"
  >
    <summary
      aria-label="切换页面主题"
      title="切换页面主题"
    >
      <span
        class="archive-theme-selector__current"
        aria-hidden="true"
      />
      <span class="sr-only">切换页面主题</span>
    </summary>

    <div
      class="archive-theme-selector__menu"
      aria-label="选择页面主题"
      role="group"
    >
      <button
        v-for="option in themes"
        :key="option.id"
        class="archive-theme-selector__option"
        :class="{ 'is-active': theme === option.id }"
        type="button"
        :aria-pressed="theme === option.id"
        @click="selectTheme(option.id)"
      >
        <span
          class="archive-theme-selector__swatch"
          :style="{ backgroundColor: option.canvas }"
          aria-hidden="true"
        />
        {{ option.label }}
      </button>
    </div>
  </details>
</template>
