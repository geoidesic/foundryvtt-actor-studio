import { expect, test } from 'vitest';
import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';

test('BIOGRAPHY_COMPLETE event when FSM is idle does not throw', () => {
  const fsm = getWorkflowFSM();

  // Ensure starting state is idle for the singleton FSM
  const currentState = fsm.getCurrentState && fsm.getCurrentState();
  expect(currentState).toBe('idle');

  // Dispatch biography_complete while idle - this previously caused an unhandled event
  expect(() => {
    fsm.handle(WORKFLOW_EVENTS.BIOGRAPHY_COMPLETE);
  }).not.toThrow();

  // After handling, FSM should transition out of idle (to creating_character as fallback)
  expect(fsm.getCurrentState()).toBe('creating_character');
});
