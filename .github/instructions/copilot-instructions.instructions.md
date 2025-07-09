# Front-end

- The front-end uses pug templates with svelte preprocess syntax. 
- Note that this does not support long expressions in attributes 
–- i.e. don't do this: `button.mt-xs(on:mousedown="{$remainingGold < 0 ? something : somethingElse}`
–- i.e. do this: `button.mt-xs(on:mousedown="{handleFinalizePurchase}` and then define in your script `const handleFinalizePurchase = $remainingGold < 0 ? something : somethingElse`
- Also note that conditinal logic needs to be nested using tabbing. I.e. the +else relating to a +if needs to be indented one extra tab compared to the +if
- Do not use `npm build` or `npm run build` in the front-end, as this will not work. Instead just tell me it's ready for testing.