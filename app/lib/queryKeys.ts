export const QueryKeys = {
  // Jogos
  fixtures:          ['fixtures'] as const,
  fixtureById:       (id: number) => ['fixtures', id] as const,
  liveFixtures:      ['fixtures', 'live'] as const,

  // Bolão
  bolaoFixtures:     ['bolao', 'fixtures'] as const,
  bolaoRanking:      ['bolao', 'ranking'] as const,
  bolaoMyPoints:     ['bolao', 'my-points'] as const,
  bolaoPrizes:       ['bolao', 'prizes'] as const,
  bolaoMyPrediction: (fixtureId: number) => ['bolao', 'prediction', fixtureId] as const,

  // Figurinhas
  stickerAlbum:      ['stickers', 'album'] as const,
  stickerPacks:      ['stickers', 'packs'] as const,
  stickerTrades:     ['stickers', 'trades'] as const,

  // Feed
  newsFeed:          (page: number) => ['news', page] as const,

  // Mapa
  venuePOIs:         (city: 'SP' | 'RJ') => ['venue-map', city] as const,

  // Perfil
  myProfile:         ['auth', 'profile'] as const,
} as const;
