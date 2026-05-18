import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { EventResponse } from "@/app/services/events/eventAppService";
import { getEventBrandKey } from "@/app/utils/eventBranding";

// Carrega a experiência completa da aba Foto IA (camera + resultados)
interface PhotoAIPageProps {
  eventId: number;
  accentColor?: string;
  isTorcida?: boolean;
}

const PhotoAIClient = dynamic<PhotoAIPageProps>(
  () => import("@/app/pages/user/photoAI/page"),
  { ssr: false }
) as ComponentType<PhotoAIPageProps>;

interface PhotoAIProps {
  eventId: number;
  event?: EventResponse;
}

export default function PhotoAI({ eventId, event }: PhotoAIProps) {
  const isTorcida = getEventBrandKey(event) === "n1_torcida";
  const accentColor = isTorcida ? "#0f935d" : undefined;
  return <PhotoAIClient eventId={eventId} accentColor={accentColor} isTorcida={isTorcida} />;
}