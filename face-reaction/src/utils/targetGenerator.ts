import { Expression, EXPRESSIONS, Target } from '../types/game';

const EXPRESSION_KEYS = Object.keys(EXPRESSIONS) as Expression[];

let targetIdCounter = 0;

export const generateTarget = (previousExpressions: Expression[]): Target => {
  let availableExpressions = [...EXPRESSION_KEYS];
  
  // Rule: Do not select the same expression more than twice in a row.
  if (previousExpressions.length >= 2) {
    const last1 = previousExpressions[previousExpressions.length - 1];
    const last2 = previousExpressions[previousExpressions.length - 2];
    
    if (last1 === last2) {
      availableExpressions = availableExpressions.filter(exp => exp !== last1);
    }
  }

  // Always avoid the immediately previous expression — guarantees no consecutive duplicates
  if (previousExpressions.length >= 1) {
    const last = previousExpressions[previousExpressions.length - 1];
    availableExpressions = availableExpressions.filter(exp => exp !== last);
  }
  
  // Failsafe in case filtering removes everything
  if (availableExpressions.length === 0) {
      availableExpressions = [...EXPRESSION_KEYS];
  }

  const randomExp = availableExpressions[Math.floor(Math.random() * availableExpressions.length)];
  
  targetIdCounter++;
  
  return {
    id: `target-${Date.now()}-${targetIdCounter}`,
    expression: randomExp
  };
};

export const generateInitialQueue = (size: number = 4): Target[] => {
  const queue: Target[] = [];
  const history: Expression[] = [];
  
  for (let i = 0; i < size; i++) {
    const target = generateTarget(history);
    queue.push(target);
    history.push(target.expression);
  }
  
  return queue;
};
