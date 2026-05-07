/**
 * Extrai mensagem de erro da resposta FastAPI.
 * Trata dois formatos:
 *  - detail: string  → retorna direto
 *  - detail: array   → erros de validação Pydantic (junta os msgs)
 */
export function extractApiError(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { detail?: unknown; message?: string } };
    message?: string;
  };

  const detail = err.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((e: { msg?: string; message?: string }) => {
        const raw = e.msg || e.message || "";
        // Pydantic v2 prefixa com "Value error, " — remove para UX limpa
        return raw.replace(/^Value error,\s*/i, "");
      })
      .join(" | ");
  }

  return err.response?.data?.message || err.message || fallback;
}
