import React from 'react';
import type { BackendQuestion } from '../../services/api';
import { MultiSelectRenderer } from './MultiSelectRenderer';
import { SingleSelectRenderer } from './SingleSelectRenderer';
import { GridSelectRenderer } from './GridSelectRenderer';
import { WheelRenderer } from './WheelRenderer';


interface Props {
  question: BackendQuestion;
  answer: any;
  onAnswer: (answer: any) => void;
  allAnswers?: Record<string, any>;
}

export const QuestionRenderer: React.FC<Props> = ({ question, answer, onAnswer, allAnswers }) => {
  switch (question.type) {
    case 'multi_select':
      return <MultiSelectRenderer question={question} answer={answer} onAnswer={onAnswer} />;
    case 'single_select':
      return <SingleSelectRenderer question={question} answer={answer} onAnswer={onAnswer} />;
    case 'grid_select':
      return <GridSelectRenderer question={question} answer={answer} onAnswer={onAnswer} />;
    case 'wheel':
      return <WheelRenderer question={question} answer={answer} onAnswer={onAnswer} />;
    default:
      return null;
  }
};
