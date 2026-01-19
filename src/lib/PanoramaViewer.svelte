<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
    export let imageUrl: string;
    export let id: string;
    
    let viewer: any;
    let container: HTMLDivElement;
    const dispatch = createEventDispatcher();
  
    export function setView(yaw: number, pitch: number, hfov: number) {
      if (viewer && typeof viewer.setYaw === 'function') {
        // 使用 false 立即跳转，防止联动回环产生的震荡
        viewer.setYaw(yaw, false);
        viewer.setPitch(pitch, false);
        viewer.setHfov(hfov, false);
      }
    }
  
    function initViewer() {
      // 1. 如果已有实例，先彻底销毁
      if (viewer) {
        try { viewer.destroy(); } catch (e) {}
        viewer = null;
      }
      
      if (!container || !imageUrl) return;
  
      // 2. 初始化查看器
      // @ts-ignore
      viewer = pannellum.viewer(container, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        compass: false,
        friction: 0.1, // 添加摩擦力让滑动更平滑
      });
      viewer.setHfov(110); // 设置初始视野范围
  
      // 3. 关键：确保在查看器加载后绑定事件
      viewer.on('touchstart', () => {
        // 如果你在控制台依然看不到这个 log，说明事件没触发
        console.log(`Viewer ${id} Moving... ${viewer.getYaw()}, ${viewer.getPitch()}, ${viewer.getHfov()}`); 
        
        dispatch('sync', {
          yaw: viewer.getYaw(),
          pitch: viewer.getPitch(),
          hfov: viewer.getHfov(),
          originId: id
        });
      });
    }
  
    // 当图片地址改变时重新初始化
    $: if (imageUrl && container) {
      initViewer();
    }
  
    onMount(() => {
      // 稍微延迟初始化，确保容器尺寸已稳定
      setTimeout(initViewer, 50);
    });
  
    onDestroy(() => {
      if (viewer) viewer.destroy();
    });
  </script>
  
  <div class="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
    <div bind:this={container} class="w-full h-full"></div>
  </div>