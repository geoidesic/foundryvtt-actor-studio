import Finity from 'finity';

// Test how Finity handles context
const testContext = {
  testValue: 'hello',
  testFunction: function() {
    return 'world';
  }
};

console.log('Original context:', testContext);
console.log('testFunction exists:', typeof testContext.testFunction === 'function');

const fsm = Finity
  .configure()
  .initialState('start')
  .state('start')
  .do(async (state, context) => {
    console.log('Inside .do() - context:', Object.keys(context));
    console.log('Inside .do() - testFunction exists:', typeof context.testFunction === 'function');
    if (context.testFunction) {
      console.log('Inside .do() - calling testFunction:', context.testFunction());
    }
  })
  .onSuccess()
    .transitionTo('end').withCondition((context) => {
      console.log('Inside condition - context keys:', Object.keys(context));
      console.log('Inside condition - testFunction exists:', typeof context.testFunction === 'function');
      if (context.testFunction) {
        console.log('Inside condition - calling testFunction:', context.testFunction());
      }
      return true;
    })
  .start(testContext);

console.log('FSM started, triggering...');
// The .do() should execute automatically when entering the start state
