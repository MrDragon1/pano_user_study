<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    export let imageUrl: string;
    let viewer: any;
    let container: HTMLDivElement;
  
    function initViewer() {
      if (viewer) viewer.destroy();
      // @ts-ignore (调用 CDN 引入的全局变量)
      viewer = pannellum.viewer(container, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        compass: true
      });
    }
  
    // 当外部传入的图片 URL 改变时，响应式更新视图
    $: if (imageUrl && container) {
      initViewer();
    }
  
    onMount(initViewer);
    onDestroy(() => { if (viewer) viewer.destroy(); });
  </script>
  
  <div bind:this={container} class="pano-container"></div>
  
  <style>
    .pano-container {
      width: 100%;
      height: 500px;
      background: #000;
      border-radius: 12px;
    }
  </style>