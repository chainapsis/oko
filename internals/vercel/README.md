# Vercel

This is for internal use only.

```sh
vercel link --yes --scope=keplrwallet --project=oko-demo-web
```

### Wasm

If you haven't built wasm before, in the workspace root,

```sh
yarn ci build_cs
```

```sh
vercel link
vercel build
vercel deploy --prebuilt
```
