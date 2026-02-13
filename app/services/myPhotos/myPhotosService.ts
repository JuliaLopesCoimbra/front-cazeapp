// Service mockado para histórico de downloads de fotos
// TODO: Implementar quando a funcionalidade de download estiver pronta

export interface DownloadedPhoto {
  id: number;
  image_url: string;
  downloaded_at: string;
  price: number;
  event_id?: number;
  event_name?: string;
}

export const getMyDownloadedPhotos = async (): Promise<DownloadedPhoto[]> => {
  // Mock data - remover quando implementar o backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        // Exemplo de dados mockados - remover quando implementar
        // {
        //   id: 1,
        //   image_url: "https://example.com/photo1.jpg",
        //   downloaded_at: "2024-01-15T10:30:00Z",
        //   price: 9.99,
        //   event_id: 1,
        //   event_name: "Carnaval 2024",
        // },
      ]);
    }, 500);
  });
};

