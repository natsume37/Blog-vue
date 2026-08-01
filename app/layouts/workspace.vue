<template>
  <div class="workspace-layout">
    <WorkspaceSidebar />
    <main class="workspace-main">
      <slot />
    </main>
    <WorkspaceContextRail />
    <WorkspaceMobileNav />
  </div>
</template>
