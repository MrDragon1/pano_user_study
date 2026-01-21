<script lang="ts">
    import { onMount } from "svelte";
    import { surveyData } from "$lib/data";
    import PanoramaViewer from "$lib/PanoramaViewer.svelte";

    // --- 状态管理 ---
    let activeGroupIndex = 0;
    let shuffledStore: Record<string, any[]> = {};
    let allAnswers: Record<string, string> = {}; // 存储所有答案
    let viewerRefs: any[] = []; // 存储当前场景的 Viewer 实例引用
    let isSubmitting = false;
    const apiUrl = import.meta.env.VITE_API_URL;
    // 洗牌逻辑
    function shuffle<T>(array: T[]): T[] {
        return [...array].sort(() => Math.random() - 0.5);
    }

    onMount(() => {
        const store: Record<string, any[]> = {};
        const initialAnswers: Record<string, string> = {};

        surveyData.forEach((group) => {
            // 1. 初始化每个场景的图片顺序
            store[group.id] = shuffle(group.images);
            // 2. 预初始化所有答案键名 (格式: "场景ID|问题ID")
            group.questions.forEach((q) => {
                initialAnswers[`${group.id}|${q.id}`] = "";
            });
        });

        shuffledStore = store;
        allAnswers = initialAnswers;
    });

    // --- 响应式变量 ---
    $: activeGroup = surveyData[activeGroupIndex];
    $: currentImages =
        activeGroup && shuffledStore[activeGroup.id]
            ? shuffledStore[activeGroup.id]
            : [];

    // 检查特定场景是否完成
    $: isGroupComplete = (groupId: string) => {
        const group = surveyData.find((g) => g.id === groupId);
        if (!group) return false;
        return group.questions.every(
            (q) => allAnswers[`${groupId}|${q.id}`] !== "",
        );
    };

    // 全局进度计算
    $: finishedCount = surveyData.filter((g) => isGroupComplete(g.id)).length;
    $: progressPercent = Math.round((finishedCount / surveyData.length) * 100);

    // --- 视角同步逻辑 ---
    function handleSync(event: CustomEvent) {
        const { yaw, pitch, hfov, originId } = event.detail;

        // 遍历 viewerRefs 数组，同步除操作源以外的所有图
        viewerRefs.forEach((vInstance, idx) => {
            if (vInstance && idx.toString() !== originId) {
                vInstance.setView(yaw, pitch, hfov);
            }
        });
    }

    // --- 场景切换行为 ---
    function switchGroup(index: number) {
        // 在切换前，可以尝试遍历旧的引用并手动销毁
        viewerRefs.forEach((v) => {
            if (v && v.destroy) v.destroy();
        });

        activeGroupIndex = index;
        viewerRefs = [];
    }

    async function handleFinalSubmit() {
        if (isSubmitting) return; // 二重保险，防止函数被意外多次触发
        isSubmitting = true;
        // 1. 构建最终数据对象（包含原始文件名映射）
        const finalResults: Record<string, any> = {
            timestamp: new Date().toISOString(),
            responses: {},
        };

        Object.entries(allAnswers).forEach(([key, selectedValue]) => {
            const [groupId, qId] = key.split("|");
            const index = parseInt(selectedValue.split(" ")[1]) - 1;
            const shuffledImages = shuffledStore[groupId];

            if (shuffledImages && shuffledImages[index]) {
                const realFileName = shuffledImages[index].url.split("/").pop();
                finalResults.responses[key] = {
                    fileName: realFileName,
                };
            }
        });

        // 2. 发送 POST 请求到你的服务器
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalResults),
            });

            if (response.ok) {
                await response.json();
                alert("提交成功！感谢参与。");
            } else {
                throw new Error(
                    "服务器响应异常" + (response.json() || "未知错误"),
                );
            }
        } catch (error) {
            console.error("提交失败:", error);
            alert("提交失败，请稍后重试。");
            isSubmitting = false;
        } finally {
            isSubmitting = false;
        }
    }
</script>

<main class="min-h-screen bg-slate-50 p-4 text-slate-900">
    <header class="max-w-4/5 mx-auto mb-4">
        <div
            class="flex items-center gap-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
            <nav class="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {#each surveyData as group, i}
                    {@const completed = isGroupComplete(group.id)}
                    <button
                        on:click={() => switchGroup(i)}
                        class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap
                        {activeGroupIndex === i
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'hover:bg-white text-slate-400'}"
                    >
                        <span
                            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                            {completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : activeGroupIndex === i
                                  ? 'bg-white text-slate-900'
                                  : 'border-slate-300'}"
                        >
                            {completed ? "✓" : i + 1}
                        </span>
                        <span class="text-sm font-bold">{group.name}</span>
                    </button>
                {/each}
            </nav>
        </div>
    </header>

    {#if activeGroup && currentImages.length > 0}
        <div class="    max-w-4/5 mx-auto flex flex-col gap-8">
            <section class="w-full space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {#key activeGroup.id}
                        {#each currentImages as img, i}
                            <div class="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md flex flex-col">
                                <div class="mb-4">
                                    <div class="relative group/thumb overflow-hidden rounded-xl border border-slate-200 bg-slate-100 w-4/5 mx-auto shadow-inner">
                                        <img 
                                            src={img.url} 
                                            alt="Full Panorama Preview" 
                                            class="w-full aspect-[2/1] object-cover block"
                                        />
                                    </div>
                                </div>
                            
                                <PanoramaViewer
                                    bind:this={viewerRefs[i]}
                                    id={i.toString()}
                                    imageUrl={img.url}
                                    on:sync={handleSync}
                                />
                            
                                <div class="mt-2 text-center">
                                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        选项 {i + 1}
                                    </span>
                                </div>
                            
                            </div>
                        {/each}
                    {/key}
                </div>
            </section>
            <aside class="w-full">
                {#key activeGroup.id}
                    <div
                        class="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100"
                    >
                        <div
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
                        >
                            {#each activeGroup.questions as q (q.id)}
                                <div
                                    class="space-y-2 flex flex-col justify-between"
                                >
                                    <div class="flex items-start gap-3">
                                        <div
                                            class="w-1.2 h-5 bg-blue-600 rounded-full shrink-0"
                                        ></div>
                                        <p
                                            class="font-extrabold text-lg text-slate-800 leading-tight"
                                        >
                                            {q.text}
                                        </p>
                                    </div>

                                    <div class="grid grid-cols-3 gap-2">
                                        {#each currentImages as _, i}
                                            {@const val = `图像 ${i + 1}`}
                                            {@const answerKey = `${activeGroup.id}|${q.id}`}
                                            <label
                                                class="relative cursor-pointer group"
                                            >
                                                <input
                                                    type="radio"
                                                    class="hidden peer"
                                                    name={answerKey}
                                                    bind:group={
                                                        allAnswers[answerKey]
                                                    }
                                                    value={val}
                                                />
                                                <div
                                                    class="py-3 px-2 text-center rounded-xl border-2 border-slate-50 bg-slate-50
                                                    transition-all duration-300 font-black text-slate-400 text-sm
                                                    peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white
                                                    group-hover:border-slate-200"
                                                >
                                                    {i + 1}
                                                </div>
                                            </label>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <div
                            class="mt-2 pt-2 border-t border-slate-100 flex justify-center"
                        >
                            {#if !isGroupComplete(activeGroup.id)}
                                <button
                                    disabled
                                    class="px-8 py-4 bg-slate-100 text-slate-300 rounded-2xl font-black text-lg cursor-not-allowed border-2 border-dashed border-slate-200"
                                >
                                    请回答所有问题以继续
                                </button>
                            {:else if activeGroupIndex < surveyData.length - 1}
                                <button
                                    on:click={() =>
                                        switchGroup(activeGroupIndex + 1)}
                                    class="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg transition-all hover:bg-blue-700 hover:-translate-y-1 active:scale-95 shadow-xl shadow-blue-900/20"
                                >
                                    下一页
                                </button>
                            {:else if finishedCount === surveyData.length}
                                <button
                                    on:click={handleFinalSubmit}
                                    disabled={isSubmitting}
                                    class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg transition-all
                                {isSubmitting
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-emerald-600 hover:-translate-y-1 active:scale-95'} 
                                shadow-2xl shadow-blue-900/20"
                                >
                                    {#if isSubmitting}
                                        正在提交，请稍候...
                                    {:else}
                                        提交所有问卷
                                    {/if}
                                </button>
                            {/if}
                        </div>
                    </div>
                {/key}
            </aside>
        </div>
    {/if}
</main>

<style>
    :global(body) {
        background-color: #f8fafc;
    }
    :global(.no-scrollbar)::-webkit-scrollbar {
        display: none;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
    }
</style>
