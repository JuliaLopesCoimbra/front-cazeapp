"use client";

import NextLink from "next/link";
import { Box, Container, Link, Typography } from "@mui/material";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";

const LAST_UPDATE = "11/05/2026";
const PUBLIC_POLICY_URL = "/pages/privacy-policy";
const DATA_REQUESTS_URL = "/pages/data-removal-request";
const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

const linkSx = {
  color: "#ffcc01",
  fontWeight: 600,
  textDecoration: "underline",
  "&:hover": { color: "#ffd633" },
};

export default function PrivacyPolicyPage() {
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
            POLÍTICA DE PRIVACIDADE DO APLICATIVO
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
            Última atualização: {LAST_UPDATE}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Este aplicativo é operado pela BANCO DE EVENTOS RIO DE JANEIRO LTDA, inscrita no CNPJ
            sob o nº 07.296522/0001-21, doravante apenas CLUBE N1.
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            A CLUBE N1 valoriza a privacidade e a proteção dos dados dos visitantes e usuários de
            seu aplicativo, de modo que elaborou a presente Política de Privacidade para demonstrar
            seu compromisso com estes princípios para dar total transparência quanto à forma com
            que realizamos o tratamento de tais informações.
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            A presente Política de Privacidade descreve como os dados pessoais dos usuários são
            coletados, utilizados, armazenados e protegidos no âmbito do aplicativo desenvolvido
            pela Picbrand, no contexto de eventos organizados em parceria com a CLUBE N1
            (doravante denominada "Plataforma").
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Ao utilizar o aplicativo, o usuário declara estar ciente e de acordo com as práticas
            descritas neste documento.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            1. TRANSPARÊNCIA NA COLETA DE DADOS (O "QUÊ")
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
            A Plataforma realiza a coleta dos seguintes dados pessoais:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 600 }}>
            1.1 Dados Cadastrais
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Nome completo
            <br />
            E-mail
            <br />
            CPF
            <br />
            Data de nascimento
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 600 }}>
            1.2 Dados de Verificação
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Confirmação de maioridade
            <br />
            Aceite dos termos relacionados à Lei Geral de Proteção de Dados (LGPD - Lei nº
            13.709/2018)
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 600 }}>
            1.3 Dados de Perfil
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Foto de perfil enviada pelo usuário
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 600 }}>
            1.4 Dados Biométricos
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A Plataforma realiza detecção e mapeamento facial, utilizando pontos biométricos da
            face do usuário.
            <br />
            Esses dados consistem em informações extraídas da imagem facial (como pontos de
            referência do rosto) e são utilizados exclusivamente para:
            <br />- Identificar o usuário em fotografias capturadas durante o evento
            <br />- Permitir a localização automatizada de imagens em que o usuário aparece
            <br />- Realizar a entrega dessas fotos de forma personalizada dentro do aplicativo
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            2. CLÁUSULA BIOMÉTRICA (URL PÚBLICA)
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O usuário declara ciência e concorda que:
            <br />- O aplicativo utiliza tecnologia de reconhecimento facial para criação de um
            mapa biométrico baseado na imagem fornecida;
            <br />- Os dados biométricos são considerados dados pessoais sensíveis, nos termos da
            LGPD;
            <br />- O tratamento desses dados ocorre de forma segura, controlada e limitada às
            finalidades descritas nesta Política;
            <br />- O consentimento é livre, informado e pode ser revogado a qualquer momento
            mediante solicitação do usuário.
            <br />
            Esta Política encontra-se disponível publicamente por meio de URL acessível (
            {PUBLIC_POLICY_URL}) conforme exigido pelas lojas de aplicativos (Apple App Store e
            Google Play).
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            3. FINALIDADE DO TRATAMENTO DOS DADOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Os dados pessoais coletados não são vendidos, alugados ou comercializados.
            <br />
            Eles são utilizados exclusivamente para as seguintes finalidades:
            <br />- Identificação única do usuário dentro do ecossistema do evento;
            <br />- Segurança e controle de acesso, incluindo validação de CPF e maioridade;
            <br />- Localização automatizada de fotos por meio de tecnologia de reconhecimento
            facial;
            <br />- Personalização da experiência do usuário dentro do aplicativo;
            <br />- Operação e melhoria contínua dos serviços oferecidos.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            4. PROTEÇÃO DE DADOS PESSOAIS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A PICBRAND e CLUBE N1 se comprometem a cumprir integralmente a Lei Geral de Proteção
            de Dados Pessoais - LGPD (Lei nº 13.709/2018), bem como toda legislação aplicável à
            privacidade e proteção de dados.
            <br />
            <br />
            A PICBRAND e CLUBE N1 declaram que realizarão o tratamento de dados pessoais fornecidos
            pelo usuário, apenas para os fins estritamente necessários à execução do presente, e de
            acordo com os princípios da finalidade, adequação, necessidade, livre acesso, qualidade
            dos dados, transparência, segurança, prevenção, não discriminação e responsabilização.
            <br />
            <br />
            A PICBRAND e CLUBE N1 comprometem-se a:
            <br />- Adotar medidas técnicas e administrativas de segurança aptas a proteger os dados
            pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição,
            perda, alteração, comunicação ou difusão;
            <br />- Assegurar que seus colaboradores, subcontratados e terceiros envolvidos no
            tratamento de dados pessoais estejam cientes das obrigações estabelecidas nesta cláusula;
            <br />- Notificar o usuário em caso de incidente de segurança que possa acarretar risco
            ou dano relevante aos titulares dos dados;
            <br />- Eliminar ou anonimizar os dados pessoais tratados ao término da relação com o
            usuário, salvo nos casos em que a manutenção for autorizada por obrigação legal ou
            regulatória.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            5. INFRAESTRUTURA E SEGURANÇA
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Os dados são armazenados e processados em ambiente seguro de computação em nuvem,
            utilizando a infraestrutura da AWS (Amazon Web Services), incluindo:
            <br />- Bancos de dados gerenciados (RDS)
            <br />- Armazenamento de arquivos (S3)
            <br />
            São adotadas medidas técnicas e administrativas adequadas para proteção dos dados,
            incluindo:
            <br />- Criptografia de ponta a ponta;
            <br />- Controle de acesso restrito;
            <br />- Monitoramento contínuo de segurança;
            <br />- Boas práticas de governança e proteção de dados.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            6. OPERAÇÃO E RESPONSABILIDADE
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            A Picbrand é a responsável técnica pelo processamento dos dados pessoais, garantindo que:
            <br />- O tratamento dos dados ocorra em conformidade com a legislação aplicável;
            <br />- Os dados não sejam compartilhados com terceiros para fins comerciais fora do
            ecossistema do evento;
            <br />- O acesso às informações seja limitado a profissionais autorizados e estritamente
            necessário para a operação da Plataforma.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            7. COMPARTILHAMENTO DE DADOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Os dados poderão ser compartilhados apenas quando necessário para:
            <br />- Cumprimento de obrigações legais ou regulatórias;
            <br />- Execução dos serviços oferecidos dentro do ecossistema do evento;
            <br />- Garantia da segurança da Plataforma e dos usuários.
            <br />
            Em nenhuma hipótese haverá comercialização de dados pessoais.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            8. DIREITO DE EXCLUSÃO E DIREITOS DO TITULAR
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            O usuário poderá, a qualquer momento, exercer seus direitos previstos na LGPD, incluindo:
            <br />- Solicitar a exclusão total de sua conta;
            <br />- Requerer a exclusão de seus dados cadastrais;
            <br />- Solicitar a remoção de sua foto de perfil;
            <br />- Solicitar a exclusão completa do seu mapeamento facial (dados biométricos);
            <br />- Revogar o consentimento para tratamento de dados.
            <br />
            As solicitações poderão ser realizadas por meio dos canais oficiais disponibilizados no
            aplicativo, incluindo a{" "}
            <Link component={NextLink} href={DATA_REQUESTS_URL} sx={linkSx}>
              solicitação de remoção de dados
            </Link>{" "}
            ({DATA_REQUESTS_URL}).
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            9. RETENÇÃO DE DADOS
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Os dados pessoais serão armazenados apenas pelo tempo necessário para cumprir as
            finalidades descritas nesta Política, respeitando obrigações legais e regulatórias
            aplicáveis.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            10. ALTERAÇÕES NA POLÍTICA DE PRIVACIDADE
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Esta Política poderá ser atualizada periodicamente. Recomendamos que o usuário revise
            este documento regularmente. O uso contínuo do aplicativo após alterações implica
            concordância com os novos termos.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
            11. CONTATO
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            Em caso de dúvidas, solicitações ou exercício de direitos relacionados à privacidade e
            proteção de dados, o usuário poderá entrar em contato pelos canais oficiais informados
            no aplicativo.
            <br />
            <br />
            Ao utilizar o aplicativo, você declara estar ciente e de acordo com esta Política de
            Privacidade.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
