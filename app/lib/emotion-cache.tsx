"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Cria um cache do Emotion que é compatível com SSR
// Usa a mesma chave para garantir consistência entre servidor e cliente
const cache = createCache({
  key: "mui-style",
  prepend: true,
});

export default function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

