import type { SurveyGroup } from './types';

export const surveyData: SurveyGroup[] = [
  {
    id: 'group-1',
    name: '城市建筑对比',
    images: [
      { id: 'p1', title: '现代广场', url: 'https://pannellum.org/images/alma.jpg' },
      { id: 'p2', title: '古典街区', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube0.jpg' }
    ],
    questions: [
      { id: 'q1', text: '哪个场景让你感到更舒适？'},
      { id: 'q2', text: '请描述你在场景中观察到的主要色调：'}
    ]
  },
  {
    id: 'group-2',
    name: '城市建筑对比2',
    images: [
      { id: 'p1', title: '现代广场2', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube1.jpg' },
      { id: 'p2', title: '古典街区2', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube2.jpg' },
      { id: 'p3', title: '街区2', url: 'https://raw.githubusercontent.com/mpetroff/pannellum/refs/heads/master/examples/examplepanocube3.jpg' },
    ],
    questions: [
      { id: 'q1', text: '哪个场景让你感到更舒适？'},
      { id: 'q2', text: '请描述你在场景中观察到的主要色调：'}
    ]
  }
];