// Service mockado para histórico de compras de fotos
// TODO: Implementar quando a funcionalidade de pagamento/compras estiver pronta

export interface PurchasedPhoto {
  id: number;
  image_url: string;
  purchased_at: string;
  price: number;
  event_id?: number;
  event_name?: string;
}

export const getMyPurchasedPhotos = async (): Promise<PurchasedPhoto[]> => {
  // Mock data - remover quando implementar o backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        // Exemplo de dados mockados - remover quando implementar
        // {
        //   id: 1,
        //   image_url: "https://example.com/photo1.jpg",
        //   purchased_at: "2024-01-15T10:30:00Z",
        //   price: 9.99,
        //   event_id: 1,
        //   event_name: "Carnaval 2024",
        // },
      ]);
    }, 500);
  });
};

