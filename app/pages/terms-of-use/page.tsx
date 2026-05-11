"use client";

import NextLink from "next/link";
import { Box, Container, Link, Typography } from "@mui/material";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";

const LAST_UPDATE = "11/05/2026";
const PRIVACY_POLICY_URL = "/pages/privacy-policy";
const DATA_REMOVAL_URL = "/pages/data-removal-request";
const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

const linkSx = {
  color: "#ffcc01",
  fontWeight: 600,
  textDecoration: "underline",
  "&:hover": { color: "#ffd633" },
};

export default function TermsOfUsePage() {
  return (
    <Box
      sx={{
        ...torcidaBackgroundSx,
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            p: { xs: 3, md: 5 },
            color: "#f2f2f2",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            POLÍTICA DE USO E TERMOS DE SERVIÇO DO APLICATIVO
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
            Última atualização: {LAST_UPDATE}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Este aplicativo é operado pela BANCO DE EVENTOS RIO DE JANEIRO LTDA, inscrita no CNPJ
            sob o nº 07.296522/0001-21, doravante apenas CLUBE N1.
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Esta Política de Uso e Termos de Serviço regula a utilização do aplicativo disponibilizado
            pela Picbrand, em parceria com a CLUBE N1 (doravante denominadas conjuntamente como
            &quot;Plataforma&quot;).
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Ao acessar ou utilizar o aplicativo, o usuário declara ter lido, compreendido e
            concordado integralmente com os presentes termos.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            1. ACEITAÇÃO DOS TERMOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O uso do aplicativo está condicionado à aceitação plena e sem reservas destes Termos de
            Uso. Caso o usuário não concorde com quaisquer das disposições aqui previstas, deverá
            abster-se de utilizar a Plataforma.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            2. FUNCIONALIDADES DO APLICATIVO
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O aplicativo tem como finalidade permitir que usuários localizem e acessem suas fotos
            em eventos, por meio de tecnologia de reconhecimento facial, além de receber notificações
            e conteúdos relacionados.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            3. CLÁUSULA DE AUTORIZAÇÃO DE USO DE IMAGEM E BIOMETRIA
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Ao utilizar o aplicativo e fornecer sua fotografia, o usuário autoriza expressamente:
            <br />
            a) A coleta, processamento e armazenamento de sua imagem facial;
            <br />
            b) A utilização de tecnologias de reconhecimento facial para mapeamento biométrico;
            <br />
            c) A comparação de sua biometria facial com imagens capturadas durante eventos, com a
            finalidade de identificar e disponibilizar fotos nas quais o usuário esteja presente;
            <br />
            d) O tratamento desses dados exclusivamente para as finalidades descritas neste termo,
            respeitando a legislação aplicável, especialmente a Lei Geral de Proteção de Dados (LGPD
            - Lei nº 13.709/2018).
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O usuário declara estar ciente de que os dados biométricos são considerados dados
            sensíveis e concorda com seu tratamento nos termos aqui estabelecidos.
            <br />
            O consentimento poderá ser revogado a qualquer tempo, mediante solicitação expressa,
            hipótese em que a conta poderá ter funcionalidades limitadas ou ser desativada.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            4. CLÁUSULA DE ISENÇÃO DE RESPONSABILIDADE (GARANTIA PICBRAND)
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            A CLUBE N1 e a Picbrand envidarão seus melhores esforços para garantir o funcionamento
            adequado da Plataforma, porém não se responsabilizam por:
            <br />
            a) Falhas, indisponibilidades ou instabilidades de conexão à internet do usuário;
            <br />
            b) Atrasos ou falhas no envio e recebimento de notificações push;
            <br />
            c) Falhas na entrega de e-mails, incluindo serviços de terceiros como sistemas de envio
            (ex.: Resend);
            <br />
            d) Interrupções temporárias do serviço decorrentes de manutenção, atualizações ou
            fatores externos;
            <br />
            e) Eventuais perdas de dados decorrentes de fatores alheios ao controle das empresas.
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A Plataforma é fornecida &quot;no estado em que se encontra&quot;, sem garantias
            expressas ou implícitas de disponibilidade contínua e livre de erros.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            5. CLÁUSULA DE PROPRIEDADE INTELECTUAL
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            a) Todo o código-fonte, arquitetura, tecnologia, algoritmos, sistemas e funcionalidades
            do aplicativo são de titularidade exclusiva da Picbrand, sendo protegidos pelas leis de
            propriedade intelectual;
            <br />
            b) A marca, identidade visual, conteúdos visuais e fotografias disponibilizadas na
            Plataforma pertencem à CLUBE N1, salvo quando indicado de outra forma;
            <br />
            c) É vedado ao usuário copiar, reproduzir, modificar, distribuir, realizar engenharia
            reversa ou explorar comercialmente qualquer parte da Plataforma sem autorização prévia e
            expressa dos titulares;
            <br />
            d) O uso indevido de qualquer propriedade intelectual poderá acarretar responsabilização
            civil e criminal.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            6. PRIVACIDADE E PROTEÇÃO DE DADOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A coleta e o tratamento de dados pessoais seguem as diretrizes da legislação vigente,
            especialmente a LGPD. Informações adicionais podem ser consultadas na{" "}
            <Link component={NextLink} href={PRIVACY_POLICY_URL} sx={linkSx}>
              Política de Privacidade
            </Link>{" "}
            da Plataforma ({PRIVACY_POLICY_URL}).
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            7. CANCELAMENTO E EXCLUSÃO DE CONTA
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O usuário poderá solicitar a exclusão de sua conta e dados pessoais a qualquer momento,
            por meio dos canais oficiais de atendimento, incluindo o formulário em{" "}
            <Link component={NextLink} href={DATA_REMOVAL_URL} sx={linkSx}>
              solicitação de remoção de dados
            </Link>{" "}
            ({DATA_REMOVAL_URL}). Após a solicitação, os dados serão tratados conforme exigido por
            lei.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            8. ALTERAÇÕES NOS TERMOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A Plataforma poderá atualizar estes Termos a qualquer momento. Recomenda-se que o
            usuário revise periodicamente este documento. O uso contínuo do aplicativo após
            alterações implica concordância com os novos termos.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            9. LEGISLAÇÃO E FORO
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Este Termo será regido pelas leis da República Federativa do Brasil.
            <br />
            Fica eleito o foro da comarca de São Paulo, para dirimir eventuais controvérsias.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            10. CONTATO
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Para dúvidas, solicitações ou exercício de direitos relacionados a dados pessoais, o
            usuário poderá entrar em contato pelos canais oficiais disponibilizados no aplicativo.
          </Typography>

          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            Ao utilizar o aplicativo, você declara estar de acordo com todos os termos acima.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
