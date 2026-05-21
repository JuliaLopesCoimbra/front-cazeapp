"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim() ?? "";

/**
 * Em localhost, não inicializa por padrão — o app N1 no OneSignal costuma estar
 * travado em https://staging.n1app.com.br (erro "Can only be used on: ...").
 * Para testar push no dev: NEXT_PUBLIC_ONESIGNAL_SKIP_ON_LOCALHOST=false
 * e cadastre http://localhost:3000 no painel OneSignal (Site URL).
 */
const SKIP_ON_LOCALHOST =
  process.env.NEXT_PUBLIC_ONESIGNAL_SKIP_ON_LOCALHOST !== "false";

function isValidOneSignalAppId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function shouldLoadOnThisHost(): boolean {
  if (!isValidOneSignalAppId(ONESIGNAL_APP_ID)) return false;
  if (SKIP_ON_LOCALHOST && isLocalDevHost()) return false;
  return true;
}

export default function OneSignalInit() {
  const [loadSdk, setLoadSdk] = useState(false);

  useEffect(() => {
    if (!shouldLoadOnThisHost()) {
      if (
        isValidOneSignalAppId(ONESIGNAL_APP_ID) &&
        SKIP_ON_LOCALHOST &&
        isLocalDevHost()
      ) {
        console.info(
          "[OneSignal] Desativado em localhost. O App ID configurado pertence ao domínio " +
            "de staging/produção no painel OneSignal. Use NEXT_PUBLIC_ONESIGNAL_SKIP_ON_LOCALHOST=false " +
            "após liberar http://localhost:3000 no painel, ou crie um app OneSignal da Casa CazéTV."
        );
      }
      return;
    }
    setLoadSdk(true);
  }, []);

  if (!loadSdk) return null;

  const appIdJson = JSON.stringify(ONESIGNAL_APP_ID);
  const allowLocalhost = isLocalDevHost();

  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            try {
              var initOptions = {
                appId: ${appIdJson},
                promptOptions: {
                  slidedown: {
                    prompts: [{
                      type: "push",
                      autoPrompt: true,
                      text: {
                        actionMessage: "Ative as notificações para receber atualizações da Casa CazéTV",
                        acceptButton: "Ativar",
                        cancelButton: "Agora não"
                      },
                      delay: { pageViews: 1, timeDelay: 1 }
                    }]
                  }
                }
              };
              ${allowLocalhost ? "initOptions.allowLocalhostAsSecureOrigin = true;" : ""}
              await OneSignal.init(initOptions);
            } catch (err) {
              var msg = err && err.message ? err.message : String(err);
              if (msg.indexOf("doesn't match existing apps") !== -1) {
                console.warn(
                  "[OneSignal] App ID diferente do salvo no navegador. Limpe Application → Clear storage."
                );
              } else if (msg.indexOf("Can only be used on") !== -1) {
                console.warn(
                  "[OneSignal] Este App ID só funciona no domínio cadastrado no painel OneSignal: " + msg
                );
              } else {
                console.error("[OneSignal]", err);
              }
            }
          });
        `}
      </Script>
    </>
  );
}
