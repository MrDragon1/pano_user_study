export interface PanoramaImage {
  id: string;    // 原始文件名
  url: string;
  title: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface SurveyGroup {
  id: string;
  name: string;
  images: PanoramaImage[];
  questions: Question[];
}

// 记录打乱后的数据结构
export interface ShuffledStore {
  [groupId: string]: PanoramaImage[];
}

// 嵌套答案结构: { groupId: { questionId: "图像 1" } }
export type AnswerStore = Record<string, Record<string, string>>;