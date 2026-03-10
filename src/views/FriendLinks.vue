<template>
  <div class="friend-links-page min-h-screen bg-slate-50 pt-24 pb-16">
    <div class="friend-links-bg">
      <div class="friend-orb friend-orb-a"></div>
      <div class="friend-orb friend-orb-b"></div>
      <div class="friend-orb friend-orb-c"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section
        class="hero-panel interactive-surface overflow-hidden rounded-[32px] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10"
        @pointermove="handleSurfaceMove"
        @pointerleave="handleSurfaceLeave"
      >
        <div class="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div class="space-y-6">
            <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              <el-icon><Connection /></el-icon>
              Friend Links
            </span>
            <div class="space-y-4">
              <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                友链。
                <span class="block text-sky-600">先看站点，再决定要不要互链。</span>
              </h1>
              <p class="max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
                这里优先展示我长期关注、愿意互链、内容风格契合的网站。互链申请入口保留在页面下方，不会抢走主视觉。
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button class="friend-cta friend-cta-primary" @click="scrollToLinks">
                <el-icon><Connection /></el-icon>
                浏览友链
              </button>
              <button class="friend-cta friend-cta-secondary" @click="scrollToApply">
                <el-icon><Promotion /></el-icon>
                申请互链
              </button>
              <button class="friend-cta friend-cta-secondary" @click="copySiteUrl">
                <el-icon><DocumentCopy /></el-icon>
                复制本站地址
              </button>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="stat-chip">
                <div class="stat-chip__label">友链总数</div>
                <div class="stat-chip__value">{{ friendLinks.length }}</div>
              </div>
              <div class="stat-chip">
                <div class="stat-chip__label">精选友链</div>
                <div class="stat-chip__value">{{ featuredCount }}</div>
              </div>
              <div class="stat-chip">
                <div class="stat-chip__label">当前分组</div>
                <div class="stat-chip__value text-xl">{{ activeGroup === '全部' ? '全部' : activeGroup }}</div>
              </div>
            </div>
          </div>

          <div class="grid gap-4">
            <div class="hero-links-card interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">精选预览</div>
                  <h2 class="mt-2 text-2xl font-semibold text-slate-900">首屏先看友链</h2>
                </div>
                <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{{ heroPreviewLinks.length }} 个站点</span>
              </div>
              <div class="mt-5 space-y-3">
                <a
                  v-for="link in heroPreviewLinks"
                  :key="link.id"
                  :href="link.url"
                  target="_blank"
                  rel="noreferrer"
                  class="hero-link-card"
                >
                  <img :src="link.logo || siteStore.siteConfig.siteAvatar" alt="logo" class="h-12 w-12 rounded-2xl border border-slate-200 object-cover" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <div class="truncate text-base font-semibold text-slate-900">{{ link.name }}</div>
                      <span v-if="link.is_featured" class="featured-pill">精选</span>
                    </div>
                    <p class="mt-1 text-sm leading-6 text-slate-500 line-clamp-2">
                      {{ link.description || '已通过审核并展示在友链目录中。' }}
                    </p>
                  </div>
                  <el-icon class="text-slate-300"><ArrowRight /></el-icon>
                </a>
              </div>
              <div v-if="!heroPreviewLinks.length" class="hero-link-empty">
                暂时还没有展示中的友链，后续会从已审核站点里补上。
              </div>
            </div>

            <div class="hero-side-note interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
              <div class="text-sm font-semibold text-slate-900">互链入口保留在下方</div>
              <p class="mt-2 text-sm leading-7 text-slate-500">
                先浏览友链目录，确认风格合适后，再到页面下半部分提交互链申请。
              </p>
              <button class="friend-cta friend-cta-secondary mt-4" @click="scrollToApply">
                <el-icon><Promotion /></el-icon>
                前往申请区
              </button>
            </div>
          </div>
        </div>

        <div v-if="avatarWallPrimary.length" class="avatar-wall">
          <div class="avatar-wall__header">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Flowing wall</div>
              <h2 class="mt-2 text-2xl font-semibold text-slate-900">友链头像墙</h2>
            </div>
            <p class="max-w-xl text-sm leading-7 text-slate-500">
              先快速扫一眼都有哪些站点，再往下进入完整友链目录。悬停卡片时，流动动画会暂停。
            </p>
          </div>

          <div class="avatar-wall__viewport">
            <div class="avatar-wall__track avatar-wall__track-forward">
              <a
                v-for="(link, index) in avatarWallPrimary"
                :key="`avatar-forward-${link.id}-${index}`"
                :href="link.url"
                target="_blank"
                rel="noreferrer"
                class="avatar-pill interactive-surface"
                @pointermove="handleSurfaceMove"
                @pointerleave="handleSurfaceLeave"
              >
                <img :src="link.logo || siteStore.siteConfig.siteAvatar" :alt="link.name" class="avatar-pill__logo" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-900">{{ link.name }}</div>
                  <div class="mt-1 truncate text-xs text-slate-400">{{ getDomain(link.url) }}</div>
                </div>
                <span v-if="link.is_featured" class="avatar-pill__tag">精选</span>
              </a>
            </div>
          </div>

          <div class="avatar-wall__viewport avatar-wall__viewport-secondary">
            <div class="avatar-wall__track avatar-wall__track-reverse">
              <a
                v-for="(link, index) in avatarWallSecondary"
                :key="`avatar-reverse-${link.id}-${index}`"
                :href="link.url"
                target="_blank"
                rel="noreferrer"
                class="avatar-pill avatar-pill-secondary interactive-surface"
                @pointermove="handleSurfaceMove"
                @pointerleave="handleSurfaceLeave"
              >
                <img :src="link.logo || siteStore.siteConfig.siteAvatar" :alt="link.name" class="avatar-pill__logo" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-slate-900">{{ link.name }}</div>
                  <div class="mt-1 truncate text-xs text-slate-400">{{ link.group_name || '推荐站点' }}</div>
                </div>
                <el-icon class="text-slate-300"><ArrowRight /></el-icon>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section ref="linksSectionRef" class="mt-10">
        <div class="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Friend links</div>
            <h2 class="mt-2 text-3xl font-semibold text-slate-900">友链目录</h2>
            <p class="mt-2 text-sm leading-7 text-slate-500">首屏下方直接进入完整友链列表，按分组筛选查看。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="group in groups"
              :key="group"
              class="filter-pill"
              :class="group === activeGroup ? 'filter-pill-active' : 'filter-pill-default'"
              @click="activeGroup = group"
            >
              {{ group }}
            </button>
          </div>
        </div>

        <div v-loading="loading" class="min-h-[240px]">
          <TransitionGroup v-if="filteredLinks.length" name="friend-card" tag="div" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <a
              v-for="(link, index) in filteredLinks"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noreferrer"
              class="friend-card group interactive-surface"
              :style="{
                '--friend-accent': link.site_color || '#38bdf8',
                '--friend-delay': `${index * 60}ms`
              }"
              @pointermove="handleSurfaceMove"
              @pointerleave="handleSurfaceLeave"
            >
              <div class="friend-card__shine"></div>
              <div class="flex items-start gap-4">
                <img
                  :src="link.logo || siteStore.siteConfig.siteAvatar"
                  alt="logo"
                  class="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="truncate text-lg font-semibold text-slate-900">{{ link.name }}</h3>
                    <span v-if="link.is_featured" class="featured-pill">精选</span>
                  </div>
                  <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span class="rounded-full bg-slate-100 px-2 py-1">{{ link.group_name || '推荐站点' }}</span>
                    <span>{{ getDomain(link.url) }}</span>
                  </div>
                </div>
                <el-icon class="mt-1 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sky-500"><ArrowRight /></el-icon>
              </div>
              <p class="mt-5 min-h-[72px] text-sm leading-7 text-slate-500 line-clamp-3">
                {{ link.description || '这个站点还没有填写简介，但已经通过审核。' }}
              </p>
              <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>收录于 {{ formatDate(link.created_at) }}</span>
                <span class="friend-card__visit">Visit</span>
              </div>
            </a>
          </TransitionGroup>

          <div v-else class="empty-shell">
            <el-icon class="text-4xl text-slate-300"><Connection /></el-icon>
            <div class="mt-4 text-lg font-semibold text-slate-700">还没有可展示的友链</div>
            <p class="mt-2 text-sm leading-7 text-slate-400">可以先提交申请，审核通过后这里会显示你的站点。</p>
          </div>
        </div>
      </section>

      <section class="mt-10 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div class="site-card interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
          <div class="flex items-start gap-4">
            <img
              :src="siteStore.siteConfig.siteAvatar"
              alt="site avatar"
              class="h-20 w-20 rounded-3xl border border-slate-200 object-cover shadow-sm"
            />
            <div class="min-w-0">
              <div class="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">本站信息</div>
              <h2 class="truncate text-2xl font-semibold text-slate-900">{{ siteStore.siteConfig.siteName }}</h2>
              <p class="mt-2 text-sm leading-7 text-slate-500">{{ siteStore.siteConfig.siteDescription }}</p>
            </div>
          </div>
          <div class="mt-5 grid gap-3 text-sm text-slate-600">
            <div class="site-card__meta">
              <span>站点地址</span>
              <strong>{{ siteUrl }}</strong>
            </div>
            <div class="site-card__meta">
              <span>站长</span>
              <strong>{{ siteStore.siteConfig.siteAuthor }}</strong>
            </div>
            <div class="site-card__meta">
              <span>联系方式</span>
              <strong>{{ socialEmail }}</strong>
            </div>
          </div>
        </div>

        <div class="rules-card interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
          <div class="mb-4 flex items-center gap-2 text-slate-900">
            <el-icon class="text-amber-500"><MagicStick /></el-icon>
            <h3 class="text-lg font-semibold">互链说明</h3>
          </div>
          <ul class="space-y-3 text-sm leading-7 text-slate-500">
            <li>站点可正常访问，内容持续更新，主题明确。</li>
            <li>申请前建议先添加本站友链，并在表单中填写互链地址。</li>
            <li>暂不收录采集站、纯广告页、无法稳定访问的站点。</li>
            <li>通过后会展示在前台，未通过或暂不上线的申请会保留在后台审核列表。</li>
          </ul>
        </div>
      </section>

      <section ref="applySectionRef" class="mt-10">
        <div
          class="apply-shell overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-500"
          :class="applicationOpen ? 'ring-1 ring-sky-200' : ''"
        >
          <div class="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Link Exchange</div>
              <h2 class="mt-2 text-2xl font-semibold text-slate-900">互链申请</h2>
              <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                浏览完上面的友链目录后，如果你的站点也适合收录，可以在这里提交申请。交互动画和提交反馈仍然保留。
              </p>
            </div>
            <button class="friend-cta friend-cta-secondary" @click="toggleApplication">
              <el-icon class="transition-transform duration-300" :class="applicationOpen ? 'rotate-45' : ''"><Plus /></el-icon>
              {{ applicationOpen ? '收起申请面板' : '展开申请面板' }}
            </button>
          </div>

          <transition name="apply-panel" mode="out-in">
            <div v-if="applicationOpen" :key="submitSuccess ? 'success' : 'form'" class="px-6 py-6 md:px-8 md:py-8">
              <div v-if="submitSuccess" class="success-panel">
                <div class="success-panel__badge">
                  <el-icon><Select /></el-icon>
                </div>
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500">Submitted</div>
                  <h3 class="mt-3 text-3xl font-semibold text-slate-900">申请已提交</h3>
                  <p class="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    你的站点信息已经进入审核队列。通过后会展示到友链页，若需要补充信息我会通过你留下的联系方式联系你。
                  </p>
                </div>
                <div class="success-panel__actions">
                  <button class="friend-cta friend-cta-primary" @click="createAnother">
                    <el-icon><RefreshRight /></el-icon>
                    再提交一个
                  </button>
                  <button class="friend-cta friend-cta-secondary" @click="applicationOpen = false">
                    收起面板
                  </button>
                </div>
              </div>

              <div v-else class="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
                <div class="space-y-4">
                  <div class="ai-tool-card interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">MCP Tool</div>
                        <div class="mt-2 text-lg font-semibold text-slate-900">AI 友链解析器</div>
                        <p class="mt-2 text-sm leading-7 text-slate-500">
                          粘贴站点介绍、友链模板、导航站卡片描述或任意资料，工具会返回结构化字段并自动填入右侧表单。
                        </p>
                      </div>
                      <div class="ai-tool-chip">friend_link_parser</div>
                    </div>

                    <textarea
                      v-model="aiToolInput"
                      class="ai-tool-textarea"
                      rows="6"
                      placeholder="示例：&#10;站点名称：Martin Blog&#10;网址：https://martin88.xyz&#10;Logo：https://.../logo.png&#10;简介：记录前端、设计和独立博客折腾过程&#10;联系方式：hello@example.com"
                      @paste="handleAiToolPaste"
                    ></textarea>

                    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div class="text-xs leading-6 text-slate-400">
                        支持自由文本，不要求固定模板。粘贴后会自动运行，也可以手动再次执行。
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button class="friend-cta friend-cta-secondary" @click="clearAiToolDraft">
                          清空内容
                        </button>
                        <button class="friend-cta friend-cta-primary" :disabled="aiToolRunning" @click="runFriendLinkTool">
                          <el-icon class="submit-icon" :class="aiToolRunning ? 'is-spinning' : ''"><Cpu /></el-icon>
                          {{ aiToolRunning ? '工具运行中...' : '运行工具' }}
                        </button>
                      </div>
                    </div>

                    <div v-if="aiToolResult" class="ai-tool-result">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="ai-tool-result__badge">模式 {{ aiToolMode }}</span>
                        <span class="ai-tool-result__badge">置信度 {{ aiToolResult.confidence || 'medium' }}</span>
                        <span v-if="aiToolResult.reasoning" class="text-xs leading-6 text-slate-500">{{ aiToolResult.reasoning }}</span>
                      </div>
                      <p v-if="aiToolSummary" class="mt-3 text-sm leading-7 text-slate-500">{{ aiToolSummary }}</p>
                      <div v-if="aiToolResult.filled_fields?.length" class="mt-3 flex flex-wrap gap-2">
                        <span v-for="field in aiToolResult.filled_fields" :key="field" class="ai-tool-pill ai-tool-pill-filled">
                          {{ getParsedFieldLabel(field) }}
                        </span>
                      </div>
                      <div v-if="aiToolResult.missing_fields?.length" class="mt-3 flex flex-wrap gap-2">
                        <span v-for="field in aiToolResult.missing_fields" :key="field" class="ai-tool-pill ai-tool-pill-missing">
                          待补 {{ getParsedFieldLabel(field) }}
                        </span>
                      </div>
                      <div v-if="aiToolAppliedFields.length" class="mt-3 flex flex-wrap gap-2">
                        <span v-for="field in aiToolAppliedFields" :key="field" class="ai-tool-pill ai-tool-pill-applied">
                          已写入 {{ field }}
                        </span>
                      </div>
                      <div v-if="aiToolPreservedFields.length" class="mt-3 flex flex-wrap gap-2">
                        <span v-for="field in aiToolPreservedFields" :key="field" class="ai-tool-pill ai-tool-pill-preserved">
                          保留原值 {{ field }}
                        </span>
                      </div>
                      <ul v-if="aiToolResult.warnings?.length" class="mt-3 space-y-2 text-sm leading-6 text-amber-700">
                        <li v-for="warning in aiToolResult.warnings" :key="warning">{{ warning }}</li>
                      </ul>
                      <div class="mt-4 flex flex-wrap gap-2">
                        <button class="friend-cta friend-cta-secondary" @click="applyLatestParserResult(false)">
                          仅补空字段
                        </button>
                        <button class="friend-cta friend-cta-secondary" @click="applyLatestParserResult(true)">
                          覆盖现有字段
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">交互步骤</div>
                  <div
                    v-for="(step, index) in applySteps"
                    :key="step.title"
                    class="step-card interactive-surface"
                    :class="{
                      'step-card-active': currentStep === index,
                      'step-card-complete': currentStep > index
                    }"
                    @pointermove="handleSurfaceMove"
                    @pointerleave="handleSurfaceLeave"
                  >
                    <div class="step-card__index">{{ index + 1 }}</div>
                    <div>
                      <div class="text-base font-semibold text-slate-900">{{ step.title }}</div>
                      <p class="mt-1 text-sm leading-7 text-slate-500">{{ step.description }}</p>
                    </div>
                  </div>

                  <div class="interaction-card interactive-surface" @pointermove="handleSurfaceMove" @pointerleave="handleSurfaceLeave">
                    <div class="interaction-card__icon">
                      <el-icon><Compass /></el-icon>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900">当前提示</div>
                      <p class="mt-1 text-sm leading-7 text-slate-500">{{ interactionHint }}</p>
                    </div>
                  </div>
                </div>

                <div
                  class="form-shell interactive-surface"
                  :class="`form-shell-step-${currentStep + 1}`"
                  @pointermove="handleSurfaceMove"
                  @pointerleave="handleSurfaceLeave"
                >
                  <div class="form-shell__glow"></div>
                  <el-form label-position="top" class="relative z-10">
                    <div class="grid gap-4 md:grid-cols-2">
                      <el-form-item label="站点名称">
                        <el-input
                          v-model="applyForm.name"
                          placeholder="例如：Martin Blog"
                          @focus="focusedField = 'name'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                      <el-form-item label="站点链接">
                        <el-input
                          v-model="applyForm.url"
                          placeholder="https://example.com"
                          @focus="focusedField = 'url'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                      <el-form-item label="Logo 地址">
                        <el-input
                          v-model="applyForm.logo"
                          placeholder="https://example.com/logo.png"
                          @focus="focusedField = 'logo'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                      <el-form-item label="站点分组">
                        <el-input
                          v-model="applyForm.group_name"
                          placeholder="技术博客 / 设计灵感 / 工具站"
                          @focus="focusedField = 'group_name'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                    </div>

                    <el-form-item label="站点简介">
                      <el-input
                        v-model="applyForm.description"
                        type="textarea"
                        :rows="3"
                        maxlength="255"
                        show-word-limit
                        placeholder="一句话介绍你的站点风格和内容方向"
                        @focus="focusedField = 'description'"
                        @blur="focusedField = ''"
                      />
                    </el-form-item>

                    <div class="grid gap-4 md:grid-cols-2">
                      <el-form-item label="联系方式">
                        <el-input
                          v-model="applyForm.contact"
                          placeholder="邮箱 / QQ / 微信"
                          @focus="focusedField = 'contact'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                      <el-form-item label="你的互链地址">
                        <el-input
                          v-model="applyForm.reciprocal_url"
                          placeholder="已添加本站友链的页面地址"
                          @focus="focusedField = 'reciprocal_url'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                    </div>

                    <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <el-form-item label="站点主题色">
                        <el-input
                          v-model="applyForm.site_color"
                          placeholder="#38bdf8"
                          @focus="focusedField = 'site_color'"
                          @blur="focusedField = ''"
                        />
                      </el-form-item>
                      <div class="flex items-center gap-3 pb-2">
                        <span class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">预览</span>
                        <span class="color-preview" :style="{ backgroundColor: colorPreview }"></span>
                      </div>
                    </div>

                    <div v-if="existingLinkMatch || formIssues.length" class="form-insight-card">
                      <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Submit check</div>
                          <div class="mt-2 text-base font-semibold text-slate-900">提交前检查</div>
                        </div>
                        <button
                          v-if="existingLinkMatch"
                          class="friend-cta friend-cta-secondary"
                          type="button"
                          @click="revealExistingLink"
                        >
                          查看已有站点
                        </button>
                      </div>

                      <div v-if="existingLinkMatch" class="form-insight-callout" :class="existingLinkMatch.type === 'exact' ? 'form-insight-callout-danger' : 'form-insight-callout-info'">
                        <div class="font-semibold text-slate-900">
                          {{ existingLinkMatch.type === 'exact' ? '检测到重复友链' : '检测到相同域名站点' }}
                        </div>
                        <div class="mt-1 text-sm leading-6 text-slate-600">
                          {{ existingLinkMatch.item.name }} · {{ existingLinkMatch.item.url }}
                        </div>
                      </div>

                      <ul v-if="formIssues.length" class="mt-4 space-y-2 text-sm leading-6 text-amber-700">
                        <li v-for="issue in formIssues" :key="issue">{{ issue }}</li>
                      </ul>
                    </div>

                    <div class="draft-preview-card">
                      <div class="draft-preview-card__head">
                        <div>
                          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live preview</div>
                          <div class="mt-2 text-base font-semibold text-slate-900">提交预览</div>
                        </div>
                        <span class="draft-preview-card__domain">{{ getDomain(draftPreview.url) || 'example.com' }}</span>
                      </div>

                      <div class="draft-preview-card__body">
                        <div
                          class="friend-card"
                          :style="{ '--friend-accent': draftPreview.site_color }"
                        >
                          <div class="friend-card__shine"></div>
                          <div class="flex items-start gap-4">
                            <img
                              :src="draftPreview.logo"
                              alt="preview logo"
                              class="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                            />
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center gap-2">
                                <h3 class="truncate text-lg font-semibold text-slate-900">{{ draftPreview.name }}</h3>
                              </div>
                              <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                <span class="rounded-full bg-slate-100 px-2 py-1">{{ draftPreview.group_name }}</span>
                                <span>{{ getDomain(draftPreview.url) || '待填写链接' }}</span>
                              </div>
                            </div>
                          </div>
                          <p class="mt-5 min-h-[72px] text-sm leading-7 text-slate-500 line-clamp-3">
                            {{ draftPreview.description }}
                          </p>
                          <div class="mt-5 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                            <div>联系方式：{{ draftPreview.contact || '待填写' }}</div>
                            <div>互链地址：{{ draftPreview.reciprocal_url || '建议补充，提高审核效率' }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <div class="text-xs leading-6 text-slate-400">
                        提交前请确保站点可访问，并尽量填写互链地址，审核会更快。
                      </div>
                      <button class="friend-cta friend-cta-primary friend-cta-submit" :disabled="submitting" @click.prevent="handleSubmit">
                        <el-icon class="submit-icon" :class="submitting ? 'is-spinning' : ''"><Promotion /></el-icon>
                        {{ submitting ? '提交中...' : '提交申请' }}
                      </button>
                    </div>
                  </el-form>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  Compass,
  Connection,
  Cpu,
  DocumentCopy,
  MagicStick,
  Plus,
  Promotion,
  RefreshRight,
  Select,
} from '@element-plus/icons-vue'
import { callMcpTool, getFriendLinks, submitFriendLinkApplication } from '../api'
import config from '../config'
import { useSiteStore } from '../stores/site'

type FriendLink = {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
  group_name?: string
  site_color?: string
  is_featured?: boolean
  created_at: string
}

type FriendLinkForm = {
  name: string
  url: string
  logo: string
  description: string
  group_name: string
  contact: string
  reciprocal_url: string
  site_color: string
}

type FriendLinkParserResult = {
  fields?: Partial<FriendLinkForm>
  filled_fields?: string[]
  missing_fields?: string[]
  warnings?: string[]
  confidence?: string
  reasoning?: string
}

type FriendLinkDraftPreview = {
  name: string
  url: string
  logo: string
  description: string
  group_name: string
  site_color: string
  contact: string
  reciprocal_url: string
}

const siteStore = useSiteStore()
const loading = ref(false)
const submitting = ref(false)
const aiToolRunning = ref(false)
const applicationOpen = ref(false)
const submitSuccess = ref(false)
const activeGroup = ref('全部')
const focusedField = ref('')
const aiToolInput = ref('')
const aiToolSummary = ref('')
const aiToolMode = ref('fallback')
const aiToolResult = ref<FriendLinkParserResult | null>(null)
const aiToolAppliedFields = ref<string[]>([])
const aiToolPreservedFields = ref<string[]>([])
const applySectionRef = ref<HTMLElement | null>(null)
const linksSectionRef = ref<HTMLElement | null>(null)
const friendLinks = ref<FriendLink[]>([])

const applyForm = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  group_name: '推荐站点',
  contact: '',
  reciprocal_url: '',
  site_color: '',
})

const applySteps = [
  {
    title: '运行 MCP 工具',
    description: '把站点资料粘贴进解析器，AI 会先提取结构化字段，再自动回填右侧表单。',
  },
  {
    title: '准备站点信息',
    description: '填写站点名称、地址和简介，让审核时能快速判断内容方向。',
  },
  {
    title: '补充互链资料',
    description: '建议附上联系方式和互链地址，这一步会明显加快处理速度。',
  },
  {
    title: '提交并等待审核',
    description: '提交后会进入审核队列，通过后前台自动展示，未通过也会保留审核记录。',
  },
]

const socialEmail = computed(() => {
  const email = (config.social.email || '').replace(/^mailto:/i, '')
  return email || '暂未公开'
})

const siteUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.origin
})

const groups = computed(() => ['全部', ...new Set(friendLinks.value.map(item => item.group_name || '推荐站点'))])

const normalizeUrl = (value: string) => {
  const raw = value.trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (/^www\./i.test(raw)) return `https://${raw}`
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:[/?#].*)?$/.test(raw)) return `https://${raw}`
  return raw
}

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isValidHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())

const filteredLinks = computed(() => {
  if (activeGroup.value === '全部') return friendLinks.value
  return friendLinks.value.filter(item => (item.group_name || '推荐站点') === activeGroup.value)
})

const featuredCount = computed(() => friendLinks.value.filter(item => item.is_featured).length)
const heroPreviewLinks = computed(() => {
  const featured = friendLinks.value.filter(item => item.is_featured)
  const source = featured.length ? featured : friendLinks.value
  return source.slice(0, 3)
})
const orderedWallLinks = computed(() => {
  const featured = friendLinks.value.filter(item => item.is_featured)
  const regular = friendLinks.value.filter(item => !item.is_featured)
  return [...featured, ...regular]
})

const buildAvatarWallSeed = (items: FriendLink[], minCount = 8) => {
  if (!items.length) return []
  const seed: FriendLink[] = []
  while (seed.length < minCount) {
    const nextItem = items[seed.length % items.length]
    if (!nextItem) break
    seed.push(nextItem)
  }
  return seed
}

const avatarWallPrimarySeed = computed(() => buildAvatarWallSeed(orderedWallLinks.value, 8))
const avatarWallSecondarySeed = computed(() => buildAvatarWallSeed([...orderedWallLinks.value].reverse(), 8))
const avatarWallPrimary = computed(() => [...avatarWallPrimarySeed.value, ...avatarWallPrimarySeed.value])
const avatarWallSecondary = computed(() => [...avatarWallSecondarySeed.value, ...avatarWallSecondarySeed.value])

const currentStep = computed(() => {
  if (submitSuccess.value) return 3
  if (aiToolRunning.value) return 0
  if (focusedField.value === 'contact' || focusedField.value === 'reciprocal_url' || focusedField.value === 'site_color') return 2
  if (applyForm.name || applyForm.url || applyForm.description || focusedField.value) return 1
  if (aiToolInput.value.trim() || aiToolResult.value) return 0
  return 0
})

const interactionHint = computed(() => {
  if (submitSuccess.value) return '申请已经完成提交，现在只需要等待后台审核。'
  if (aiToolRunning.value) return 'MCP 工具正在解析粘贴内容，识别到的字段会自动写入表单。'
  if (currentStep.value === 1) return '基础字段已经有了，再补一段简介和 Logo，卡片展示会更完整。'
  if (currentStep.value === 2) return '把联系方式和互链地址补齐，管理员处理会更快。'
  return '先把站点资料粘贴进 MCP 工具，AI 会先帮你拆出表单字段。'
})

const colorPreview = computed(() => {
  const raw = applyForm.site_color.trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : '#38bdf8'
})

const normalizedApplyUrl = computed(() => normalizeUrl(applyForm.url))
const normalizedLogoUrl = computed(() => normalizeUrl(applyForm.logo))
const normalizedReciprocalUrl = computed(() => normalizeUrl(applyForm.reciprocal_url))

const existingLinkMatch = computed(() => {
  const targetUrl = normalizedApplyUrl.value
  if (!targetUrl || !isValidHttpUrl(targetUrl)) return null

  const exact = friendLinks.value.find((item) => normalizeUrl(item.url) === targetUrl)
  if (exact) {
    return { type: 'exact' as const, item: exact }
  }

  const targetDomain = getDomain(targetUrl)
  if (!targetDomain) return null
  const sameDomain = friendLinks.value.find((item) => getDomain(normalizeUrl(item.url)) === targetDomain)
  if (!sameDomain) return null
  return { type: 'domain' as const, item: sameDomain }
})

const formIssues = computed(() => {
  const issues: string[] = []
  if (applyForm.url.trim() && !isValidHttpUrl(normalizedApplyUrl.value)) {
    issues.push('站点链接格式不正确，请填写可访问的 http/https 地址。')
  }
  if (applyForm.logo.trim() && !isValidHttpUrl(normalizedLogoUrl.value)) {
    issues.push('Logo 地址格式不正确，建议填写完整图片链接。')
  }
  if (applyForm.reciprocal_url.trim() && !isValidHttpUrl(normalizedReciprocalUrl.value)) {
    issues.push('互链地址格式不正确，请填写展示本站友链的页面地址。')
  }
  if (applyForm.site_color.trim() && !isValidHexColor(applyForm.site_color)) {
    issues.push('站点主题色需为 #RGB 或 #RRGGBB 格式。')
  }
  if (applyForm.description.trim().length > 220) {
    issues.push('站点简介尽量控制在 220 字以内，前台卡片展示更完整。')
  }
  if (existingLinkMatch.value?.type === 'exact') {
    issues.push('这个站点已经在友链目录中，无需重复申请。')
  }
  return issues
})

const draftPreview = computed<FriendLinkDraftPreview>(() => ({
  name: applyForm.name.trim() || '你的站点名称',
  url: normalizedApplyUrl.value || 'https://example.com',
  logo: normalizedLogoUrl.value || siteStore.siteConfig.siteAvatar,
  description: applyForm.description.trim() || '一句话介绍你的站点风格和内容方向，审核时会优先看这一段。',
  group_name: applyForm.group_name.trim() || '推荐站点',
  site_color: colorPreview.value,
  contact: applyForm.contact.trim(),
  reciprocal_url: normalizedReciprocalUrl.value,
}))

const parsedFieldLabels: Record<keyof FriendLinkForm, string> = {
  name: '站点名称',
  url: '站点链接',
  logo: 'Logo',
  description: '站点简介',
  group_name: '站点分组',
  contact: '联系方式',
  reciprocal_url: '互链地址',
  site_color: '主题色',
}

const getParsedFieldLabel = (field: string) => {
  return parsedFieldLabels[field as keyof FriendLinkForm] || field
}

const resetForm = () => {
  applyForm.name = ''
  applyForm.url = ''
  applyForm.logo = ''
  applyForm.description = ''
  applyForm.group_name = '推荐站点'
  applyForm.contact = ''
  applyForm.reciprocal_url = ''
  applyForm.site_color = ''
  focusedField.value = ''
}

const applyParsedFields = (fields?: Partial<FriendLinkForm>, options?: { overwrite?: boolean }) => {
  if (!fields) return { applied: [] as string[], preserved: [] as string[] }

  const overwrite = !!options?.overwrite
  const applied: string[] = []
  const preserved: string[] = []
  const entries = Object.entries(fields) as Array<[keyof FriendLinkForm, string | undefined]>
  for (const [key, value] of entries) {
    const normalized = typeof value === 'string' ? value.trim() : ''
    if (!normalized) continue

    const currentValue = applyForm[key].trim()
    if (!overwrite && currentValue) {
      preserved.push(parsedFieldLabels[key])
      continue
    }

    if (key === 'url' || key === 'logo' || key === 'reciprocal_url') {
      applyForm[key] = normalizeUrl(normalized)
    } else {
      applyForm[key] = normalized
    }
    applied.push(parsedFieldLabels[key])
  }
  aiToolAppliedFields.value = applied
  aiToolPreservedFields.value = preserved
  return { applied, preserved }
}

const fetchFriendLinks = async () => {
  loading.value = true
  try {
    const res: any = await getFriendLinks()
    if (res.code === 200) {
      friendLinks.value = res.data || []
      if (activeGroup.value !== '全部' && !friendLinks.value.some(item => (item.group_name || '推荐站点') === activeGroup.value)) {
        activeGroup.value = '全部'
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const scrollToApply = () => {
  applicationOpen.value = true
  applySectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollToLinks = () => {
  linksSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const toggleApplication = () => {
  applicationOpen.value = !applicationOpen.value
  if (applicationOpen.value) {
    applySectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const copySiteUrl = async () => {
  if (!siteUrl.value) return
  try {
    await navigator.clipboard.writeText(siteUrl.value)
    ElMessage.success('本站地址已复制')
  } catch (error) {
    console.error(error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const clearAiToolDraft = () => {
  aiToolInput.value = ''
  aiToolSummary.value = ''
  aiToolMode.value = 'fallback'
  aiToolResult.value = null
  aiToolAppliedFields.value = []
  aiToolPreservedFields.value = []
}

const applyLatestParserResult = (overwrite = false) => {
  if (!aiToolResult.value?.fields) return
  const { applied, preserved } = applyParsedFields(aiToolResult.value.fields, { overwrite })

  if (applied.length && preserved.length) {
    ElMessage.success(`已填入：${applied.join('、')}；保留原值：${preserved.join('、')}`)
    return
  }
  if (applied.length) {
    ElMessage.success(`已${overwrite ? '覆盖' : '填入'}：${applied.join('、')}`)
    return
  }
  if (preserved.length) {
    ElMessage.info(`当前表单已有内容，已保留：${preserved.join('、')}`)
    return
  }
  ElMessage.warning('没有可回填的字段')
}

const runFriendLinkTool = async () => {
  if (!aiToolInput.value.trim()) {
    ElMessage.warning('请先粘贴一段友链资料或站点介绍')
    return
  }

  aiToolRunning.value = true
  applicationOpen.value = true
  try {
    const res: any = await callMcpTool({
      name: 'friend_link_parser',
      arguments: {
        raw_text: aiToolInput.value,
        context: {
          default_group: applyForm.group_name || '推荐站点',
          current_site_url: siteUrl.value,
        },
      },
    })
    if (res.code !== 200 || !res.data) {
      ElMessage.warning(res.msg || '工具调用失败')
      return
    }

    aiToolMode.value = res.data.mode || 'fallback'
    aiToolSummary.value = res.data.content?.[0]?.text || ''
    aiToolResult.value = (res.data.structuredContent || {}) as FriendLinkParserResult

    applyLatestParserResult(false)
  } catch (error) {
    console.error(error)
    ElMessage.error('工具运行失败，请稍后再试')
  } finally {
    aiToolRunning.value = false
  }
}

const handleAiToolPaste = () => {
  window.setTimeout(() => {
    if (!aiToolRunning.value && aiToolInput.value.trim()) {
      runFriendLinkTool()
    }
  }, 0)
}

const createAnother = () => {
  submitSuccess.value = false
  resetForm()
  clearAiToolDraft()
}

const revealExistingLink = () => {
  const match = existingLinkMatch.value
  if (!match) return
  activeGroup.value = match.item.group_name || '全部'
  linksSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const buildApplyPayload = (): FriendLinkForm => ({
  name: applyForm.name.trim(),
  url: normalizeUrl(applyForm.url),
  logo: normalizeUrl(applyForm.logo),
  description: applyForm.description.trim(),
  group_name: applyForm.group_name.trim() || '推荐站点',
  contact: applyForm.contact.trim(),
  reciprocal_url: normalizeUrl(applyForm.reciprocal_url),
  site_color: applyForm.site_color.trim(),
})

const handleSubmit = async () => {
  const payload = buildApplyPayload()

  if (!payload.name || !payload.url) {
    ElMessage.warning('请先填写站点名称和站点链接')
    return
  }
  if (!isValidHttpUrl(payload.url)) {
    ElMessage.warning('请填写有效的站点链接')
    return
  }
  if (payload.logo && !isValidHttpUrl(payload.logo)) {
    ElMessage.warning('Logo 地址格式不正确')
    return
  }
  if (payload.reciprocal_url && !isValidHttpUrl(payload.reciprocal_url)) {
    ElMessage.warning('请填写有效的互链地址')
    return
  }
  if (payload.site_color && !isValidHexColor(payload.site_color)) {
    ElMessage.warning('站点主题色需为 #RGB 或 #RRGGBB 格式')
    return
  }
  if (existingLinkMatch.value?.type === 'exact') {
    ElMessage.warning('这个站点已经在友链目录中，无需重复申请')
    revealExistingLink()
    return
  }
  if (!payload.contact) {
    ElMessage.warning('请至少留下一个联系方式')
    return
  }

  Object.assign(applyForm, payload)
  submitting.value = true
  try {
    const res: any = await submitFriendLinkApplication(payload)
    if (res.code !== 200) {
      ElMessage.warning(res.msg || '提交失败')
      return
    }
    submitSuccess.value = true
    ElMessage.success('申请已提交，等待审核')
    resetForm()
    clearAiToolDraft()
  } catch (error) {
    console.error(error)
    ElMessage.error('提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

const handleSurfaceMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  const element = event.currentTarget as HTMLElement | null
  if (!element) return

  const rect = element.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const offsetY = event.clientY - rect.top
  const percentX = offsetX / rect.width
  const percentY = offsetY / rect.height
  const rotateY = (percentX - 0.5) * 10
  const rotateX = (0.5 - percentY) * 8

  element.style.setProperty('--mouse-x', `${offsetX}px`)
  element.style.setProperty('--mouse-y', `${offsetY}px`)
  element.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`)
  element.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`)
}

const handleSurfaceLeave = (event: PointerEvent) => {
  const element = event.currentTarget as HTMLElement | null
  if (!element) return
  element.style.setProperty('--mouse-x', '50%')
  element.style.setProperty('--mouse-y', '50%')
  element.style.setProperty('--rotate-x', '0deg')
  element.style.setProperty('--rotate-y', '0deg')
}

const formatDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

onMounted(() => {
  fetchFriendLinks()
})
</script>

<style scoped>
.friend-links-page {
  position: relative;
}

.friend-links-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.friend-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(32px);
  opacity: 0.48;
  animation: float-orb 14s ease-in-out infinite;
}

.friend-orb-a {
  top: 4rem;
  left: -3rem;
  width: 18rem;
  height: 18rem;
  background: rgba(56, 189, 248, 0.18);
}

.friend-orb-b {
  top: 18rem;
  right: -5rem;
  width: 22rem;
  height: 22rem;
  background: rgba(14, 165, 233, 0.14);
  animation-delay: -4s;
}

.friend-orb-c {
  bottom: 10rem;
  left: 24%;
  width: 16rem;
  height: 16rem;
  background: rgba(244, 114, 182, 0.12);
  animation-delay: -8s;
}

.hero-panel {
  position: relative;
}

.interactive-surface {
  position: relative;
  isolation: isolate;
  transform-style: preserve-3d;
  will-change: transform;
  transform:
    perspective(1400px)
    translate3d(var(--surface-shift-x, 0px), var(--surface-lift, 0px), 0)
    rotateX(var(--rotate-x, 0deg))
    rotateY(var(--rotate-y, 0deg));
  transition: transform 0.2s ease, box-shadow 0.28s ease, border-color 0.28s ease, background 0.28s ease;
}

.interactive-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(125, 211, 252, 0.22), transparent 26%),
    radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3), transparent 12%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
}

.interactive-surface:hover {
  --surface-lift: -2px;
}

.interactive-surface:hover::after {
  opacity: 1;
}

.interactive-surface > * {
  position: relative;
  z-index: 1;
}

.hero-links-card,
.hero-side-note {
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.93));
  padding: 1.3rem;
}

.hero-link-card {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  padding: 0.95rem;
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.hero-link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
}

.hero-link-empty {
  border-radius: 18px;
  border: 1px dashed rgba(203, 213, 225, 0.9);
  padding: 1rem;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.7;
}

.avatar-wall {
  margin-top: 2rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding-top: 1.6rem;
}

.avatar-wall__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar-wall__viewport {
  position: relative;
  overflow: hidden;
  margin-top: 0.8rem;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.avatar-wall__viewport:hover .avatar-wall__track {
  animation-play-state: paused;
}

.avatar-wall__viewport-secondary {
  margin-top: 0.9rem;
}

.avatar-wall__track {
  display: flex;
  width: max-content;
  gap: 1rem;
}

.avatar-wall__track-forward {
  animation: marquee-left 30s linear infinite;
}

.avatar-wall__track-reverse {
  animation: marquee-right 34s linear infinite;
}

.avatar-pill {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 220px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.88);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.75rem 0.95rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.avatar-pill:hover {
  --surface-lift: -3px;
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 16px 32px rgba(14, 165, 233, 0.12);
}

.avatar-pill-secondary {
  background: rgba(248, 250, 252, 0.94);
}

.avatar-pill__logo {
  height: 48px;
  width: 48px;
  flex-shrink: 0;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  object-fit: cover;
}

.avatar-pill__tag {
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
  padding: 0.28rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.friend-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 9999px;
  padding: 0.9rem 1.3rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.friend-cta:hover {
  transform: translateY(-2px);
}

.friend-cta-primary {
  color: white;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8 52%, #22d3ee);
  box-shadow: 0 18px 30px rgba(14, 165, 233, 0.22);
}

.friend-cta-secondary {
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.friend-cta-submit[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.friend-cta[disabled] {
  opacity: 0.72;
  cursor: not-allowed;
  transform: none;
}

.stat-chip,
.site-card,
.rules-card,
.interaction-card,
.ai-tool-card {
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.ai-tool-card {
  padding: 1.15rem;
}

.ai-tool-chip,
.ai-tool-result__badge,
.ai-tool-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
}

.ai-tool-chip {
  flex-shrink: 0;
  background: rgba(14, 165, 233, 0.08);
  color: #0284c7;
  padding: 0.45rem 0.7rem;
}

.ai-tool-textarea {
  width: 100%;
  margin-top: 1rem;
  resize: vertical;
  border-radius: 20px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(248, 250, 252, 0.92);
  padding: 1rem 1.05rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.ai-tool-textarea:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.18);
  background: white;
}

.ai-tool-result {
  margin-top: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(186, 230, 253, 0.88);
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.95), rgba(248, 250, 252, 0.92));
  padding: 1rem;
}

.ai-tool-result__badge {
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  padding: 0.35rem 0.65rem;
}

.ai-tool-pill {
  padding: 0.34rem 0.65rem;
}

.ai-tool-pill-filled {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}

.ai-tool-pill-applied {
  background: rgba(56, 189, 248, 0.12);
  color: #0369a1;
}

.ai-tool-pill-preserved {
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
}

.ai-tool-pill-missing {
  background: rgba(251, 191, 36, 0.12);
  color: #b45309;
}

.form-insight-card,
.draft-preview-card {
  margin-top: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(248, 250, 252, 0.82);
  padding: 1rem;
}

.form-insight-callout {
  margin-top: 1rem;
  border-radius: 18px;
  padding: 0.9rem 1rem;
}

.form-insight-callout-danger {
  border: 1px solid rgba(248, 113, 113, 0.22);
  background: rgba(254, 242, 242, 0.88);
}

.form-insight-callout-info {
  border: 1px solid rgba(56, 189, 248, 0.22);
  background: rgba(240, 249, 255, 0.88);
}

.draft-preview-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.draft-preview-card__domain {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  padding: 0.42rem 0.7rem;
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
}

.draft-preview-card__body {
  margin-top: 1rem;
}

.stat-chip {
  padding: 1rem 1.15rem;
}

.stat-chip__label {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
}

.stat-chip__value {
  margin-top: 0.55rem;
  font-size: 1.7rem;
  font-weight: 700;
  color: #0f172a;
}

.site-card,
.rules-card {
  padding: 1.4rem;
}

.site-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.9);
  padding: 0.85rem 1rem;
}

.site-card__meta strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0f172a;
}

.apply-shell {
  position: relative;
}

.step-card,
.interaction-card,
.form-shell,
.success-panel,
.friend-card,
.empty-shell {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
}

.step-card {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 16px;
  align-items: start;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  padding: 1rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.step-card__index {
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #e2e8f0;
  font-weight: 700;
  color: #475569;
}

.step-card-active {
  --surface-shift-x: 6px;
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.1);
}

.step-card-active .step-card__index,
.step-card-complete .step-card__index {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
  color: white;
}

.interaction-card {
  display: flex;
  gap: 16px;
  border: 1px solid rgba(186, 230, 253, 0.8);
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.95), rgba(236, 254, 255, 0.9));
  padding: 1rem 1.1rem;
}

.interaction-card__icon {
  display: flex;
  height: 42px;
  width: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: white;
  color: #0284c7;
  box-shadow: 0 10px 22px rgba(14, 165, 233, 0.12);
}

.form-shell {
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  padding: 1.2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-shell-step-2 {
  --surface-lift: -2px;
  box-shadow: 0 16px 40px rgba(14, 165, 233, 0.08);
}

.form-shell__glow {
  position: absolute;
  inset: -30% auto auto 70%;
  width: 180px;
  height: 180px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.18), transparent 68%);
  pointer-events: none;
}

.color-preview {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.45);
}

.submit-icon.is-spinning {
  animation: spin 0.9s linear infinite;
}

.success-panel {
  display: grid;
  gap: 24px;
  align-items: center;
  border: 1px solid rgba(187, 247, 208, 0.9);
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.98), rgba(240, 253, 244, 0.92));
  padding: 2rem;
}

.success-panel::before,
.success-panel::after {
  content: "";
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.16), transparent 68%);
}

.success-panel::before {
  top: -36px;
  right: -28px;
}

.success-panel::after {
  bottom: -54px;
  left: -24px;
}

.success-panel__badge {
  display: flex;
  height: 76px;
  width: 76px;
  align-items: center;
  justify-content: center;
  border-radius: 26px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  font-size: 1.7rem;
  box-shadow: 0 22px 40px rgba(16, 185, 129, 0.25);
  animation: success-pop 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-pill {
  border-radius: 9999px;
  padding: 0.65rem 1rem;
  font-size: 0.92rem;
  transition: all 0.25s ease;
}

.filter-pill-default {
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  color: #64748b;
}

.filter-pill-default:hover {
  border-color: rgba(56, 189, 248, 0.35);
  color: #0284c7;
}

.filter-pill-active {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white;
  box-shadow: 0 12px 28px rgba(14, 165, 233, 0.22);
}

.friend-card {
  border: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--friend-accent) 18%, white), transparent 40%);
  padding: 1.2rem;
  transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
}

.friend-card:hover {
  --surface-lift: -6px;
  border-color: color-mix(in srgb, var(--friend-accent) 38%, white);
  box-shadow: 0 18px 36px color-mix(in srgb, var(--friend-accent) 18%, rgba(15, 23, 42, 0.08));
}

.friend-card__shine {
  position: absolute;
  inset: 0 auto 0 -55%;
  width: 34%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.42), transparent);
  pointer-events: none;
}

.friend-card:hover .friend-card__shine {
  animation: card-shine 0.9s ease;
}

.friend-card__visit {
  color: var(--friend-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.featured-pill {
  border-radius: 9999px;
  background: rgba(250, 204, 21, 0.12);
  color: #b45309;
  padding: 0.25rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.empty-shell {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(203, 213, 225, 0.9);
  background: rgba(255, 255, 255, 0.7);
}

.apply-panel-enter-active,
.apply-panel-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.apply-panel-enter-from,
.apply-panel-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.friend-card-enter-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--friend-delay);
}

.friend-card-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.98);
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -16px, 0);
  }
}

@keyframes card-shine {
  from {
    transform: translateX(-130%) rotate(12deg);
  }
  to {
    transform: translateX(280%) rotate(12deg);
  }
}

@keyframes marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes success-pop {
  0% {
    transform: scale(0.72);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .success-panel {
    padding: 1.4rem;
  }

  .stat-chip__value {
    font-size: 1.4rem;
  }

  .avatar-pill {
    min-width: 180px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .friend-orb,
  .success-panel__badge,
  .submit-icon.is-spinning,
  .friend-card:hover .friend-card__shine,
  .avatar-wall__track {
    animation: none;
  }

  .friend-card,
  .friend-cta,
  .step-card,
  .form-shell,
  .interactive-surface {
    transition: none;
  }

  .interactive-surface {
    transform: none;
  }

  .interactive-surface::after {
    display: none;
  }
}
</style>
