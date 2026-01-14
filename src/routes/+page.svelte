<script lang="ts">
    import { onMount } from 'svelte';
    import { surveyData } from '$lib/data';
    import type { SurveyGroup, PanoramaImage, ShuffledStore } from '$lib/types';
    import PanoramaViewer from '$lib/PanoramaViewer.svelte';
  
    // --- 状态管理 ---
    let activeGroupIndex = 0;
    let currentImgIndex = 0;
    let shuffledStore: ShuffledStore = {};
    
    /** * 修复核心：使用扁平化存储 
     * 结构如: { "groupA|q1": "图像 1", "groupA|q2": "图像 2" }
     */
    let allAnswers: Record<string, string> = {};
  
    // --- 初始化：洗牌逻辑 ---
    function shuffle<T>(array: T[]): T[] {
      return [...array].sort(() => Math.random() - 0.5);
    }
  
    onMount(() => {
      const store: ShuffledStore = {};
      surveyData.forEach(group => {
        store[group.id] = shuffle(group.images);
      });
      shuffledStore = store;
    });
  
    // --- 计算属性 ---
    $: activeGroup = surveyData[activeGroupIndex];
    $: currentShuffledImages = (activeGroup && shuffledStore[activeGroup.id]) ? shuffledStore[activeGroup.id] : [];
    
    // 检查特定场景是否完成（反应式函数）
    $: isGroupComplete = (groupId: string) => {
      const group = surveyData.find(g => g.id === groupId);
      if (!group) return false;
      // 检查该组下所有问题是否在 allAnswers 中都有值
      return group.questions.every(q => allAnswers[`${groupId}|${q.id}`]);
    };
  
    // 修复核心：检查全局是否完成的反应式声明
    $: finishedGroupsCount = surveyData.filter(g => isGroupComplete(g.id)).length;
    $: isAllFinished = finishedGroupsCount === surveyData.length;
  
    // --- 行为逻辑 ---
    function switchGroup(index: number) {
      activeGroupIndex = index;
      currentImgIndex = 0;
    }
  
    function handleFinalSubmit() {
      const finalReport = surveyData.map(group => {
        return {
          scene: group.name,
          sceneId: group.id,
          results: group.questions.map(q => {
            const label = allAnswers[`${group.id}|${q.id}`];
            const idx = parseInt(label.replace('图像 ', '')) - 1;
            return {
              questionId: q.id,
              selectedFile: shuffledStore[group.id][idx].id
            };
          })
        };
      });
  
      console.log("=== 问卷测试结果输出 ===");
      console.table(finalReport.flatMap(g => g.results.map(r => ({...r, scene: g.scene}))));
      alert("测试成功！结果已输出至控制台。");
    }
  </script>
  
  <main class="app-container">
    <nav class="progress-bar">
      {#each surveyData as group, i}
        <button 
          class="nav-item" 
          class:active={activeGroupIndex === i}
          class:completed={isGroupComplete(group.id)}
          on:click={() => switchGroup(i)}
        >
          <span class="status-icon">
            {#if isGroupComplete(group.id)} ✓ {:else} {i + 1} {/if}
          </span>
          <span class="nav-label">{group.name}</span>
        </button>
      {/each}
    </nav>
  
    {#if activeGroup && currentShuffledImages.length > 0}
      <div class="main-layout">
        <section class="viewer-section">
          <div class="viewer-card">
            {#key currentShuffledImages[currentImgIndex].url}
              <PanoramaViewer imageUrl={currentShuffledImages[currentImgIndex].url} />
            {/key}
            
            <div class="image-switcher">
              <span class="hint">切换观察图像：</span>
              <div class="btn-group">
                {#each currentShuffledImages as _, i}
                  <button 
                    class:active={currentImgIndex === i}
                    on:click={() => currentImgIndex = i}
                  >
                    图像 {i + 1}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </section>
  
        <aside class="survey-section">
          <div class="section-title">
            <h2>{activeGroup.name} - 问卷</h2>
            <p class="desc">请根据观察，在下方选择最符合的图像编号</p>
          </div>
  
          {#each activeGroup.questions as q}
            <div class="q-card">
              <p class="q-text">{q.text}</p>
              <div class="radio-group">
                {#each currentShuffledImages as _, i}
                  {@const val = `图像 ${i + 1}`}
                  <label class="radio-tile">
                    <input 
                      type="radio" 
                      bind:group={allAnswers[`${activeGroup.id}|${q.id}`]} 
                      value={val} 
                    />
                    <span class="tile-label">{val}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
  
          <div class="submit-area">
            {#if isAllFinished}
              <button class="btn-submit primary" on:click={handleFinalSubmit}>
                提交全部场景问卷
              </button>
            {:else}
              <button class="btn-submit disabled" disabled>
                请完成所有场景 (目前: {finishedGroupsCount}/{surveyData.length})
              </button>
            {/if}
          </div>
        </aside>
      </div>
    {/if}
  </main>
  
  <style>
    /* 保持原有样式不变 */
    :global(body) { background-color: #f0f2f5; margin: 0; font-family: sans-serif; }
    .app-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .progress-bar { display: flex; gap: 10px; margin-bottom: 20px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .nav-item { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px; border: 2px solid #eee; border-radius: 8px; background: none; cursor: pointer; transition: all 0.2s; }
    .nav-item.active { border-color: #3498db; background: #ebf5ff; }
    .nav-item.completed { border-color: #2ecc71; color: #27ae60; }
    .status-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #eee; border-radius: 50%; font-size: 12px; font-weight: bold; }
    .completed .status-icon { background: #2ecc71; color: white; }
    .main-layout { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }
    .viewer-card { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .image-switcher { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
    .btn-group { display: flex; gap: 8px; margin-top: 10px; }
    .btn-group button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; }
    .btn-group button.active { background: #3498db; color: white; border-color: #3498db; }
    .survey-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .q-card { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px dashed #eee; }
    .q-text { font-weight: bold; font-size: 1.1rem; margin-bottom: 15px; color: #2c3e50; }
    .radio-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .radio-tile { display: block; position: relative; cursor: pointer; }
    .radio-tile input { position: absolute; opacity: 0; }
    .tile-label { display: block; padding: 10px; text-align: center; border: 1px solid #ddd; border-radius: 6px; transition: all 0.2s; background: #fdfdfd; }
    .radio-tile input:checked + .tile-label { background: #3498db; color: white; border-color: #3498db; transform: scale(1.02); }
    .submit-area { margin-top: 30px; }
    .btn-submit { width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }
    .primary { background: #2ecc71; color: white; transition: background 0.3s; }
    .primary:hover { background: #27ae60; }
    .disabled { background: #bdc3c7; color: #ecf0f1; cursor: not-allowed; }
  </style>