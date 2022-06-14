# Drouxy Assistant

This template should help get you started developing with Svelte and TypeScript in Vite.

![Demo](mock/ezgif-1-f3f8ddf8b7.gif)

Souce: [link](https://dribbble.com/shots/14782390-Meet-Chatbot-Elwa-powered-by-ui42)

## Get Started

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.
  `vite dev` and `vite build` wouldn't work in a SvelteKit environment, for example.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.


```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```

## Extends

- ### [wit.ai](https://wit.ai/)

- ### [Rasa](https://rasa.com/open-source/)