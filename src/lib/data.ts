import type { SurveyGroup } from './types';

export const surveyData: SurveyGroup[] = [
  {
    id: 'group-1',
    name: '场景1',
    images: [
      { id: 'p1', url: 'alma.jpg' },
      { id: 'p2', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube0.jpg' }
    ],
    questions: [
      { id: 'q1', text: '哪个场景的内容' },
      { id: 'q2', text: '请描述你在场景中观察到的主要色调：' },
      { id: 'q3', text: '请描述你在场景中观察到的主要色调：' },
      { id: 'q4', text: '请描述你在场景中观察到的主要色调：' }
    ]
  },
  {
    id: 'group-2',
    name: '场景2',
    images: [
      { id: 'p1', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube1.jpg' },
      { id: 'p2', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube2.jpg' },
      { id: 'p3', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube3.jpg' },
      { id: 'p4', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube3.jpg' },
      { id: 'p5', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube3.jpg' },
      { id: 'p6', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube3.jpg' },
    ],
    questions: [
      { id: 'q1', text: '哪个场景让你感到更舒适？' },
      { id: 'q2', text: '请描述你在场景中观察到的主要色调：' },
      { id: 'q3', text: '请描述你在场景中观察到的主要色调：' },
      { id: 'q4', text: '请描述你在场景中观察到的主要色调：' }
    ]
  }
];