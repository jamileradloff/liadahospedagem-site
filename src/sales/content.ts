// Copy for the "Pede assim pra IA" sales page, word for word from the approved v2 design (Nov 17).

export const PAGE_TITLE = 'Pede assim pra IA | Lia da Hospedagem'
export const PAGE_DESCRIPTION =
  '12 instruções testadas no ChatGPT grátis pra pedir à IA um rascunho de mensagem pro hóspede. PDF de 15 páginas por R$10.'

/** Turn on only after Hotmart approves product 8990830; until then no buy link is shown anywhere. */
export const CHECKOUT_LIVE = false
export const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/T108525255F'

export const HERO_TITLE = {
  lead: 'É sempre a mesma pergunta. ',
  highlight: 'Pede assim pra\u00a0IA.',
}

export const HERO = {
  subtitle:
    '12 instruções testadas no ChatGPT grátis, uma pra cada situação com hóspede. Você preenche com os dados da sua reserva, a IA escreve um rascunho e você confere antes de mandar.',
  price: 'R$10',
  priceDetail: 'PDF de 15 páginas, feito pro celular · pagamento único',
  buy: 'Quero meu PDF por R$10',
  exampleFirst: 'Antes, quero ver um exemplo ↓',
  example: 'Ver um exemplo ↓',
  delivery: 'Entrega pela Hotmart após a confirmação do pagamento.',
}

export const PENDING_NOTE = { lead: 'Checkout pendente.', rest: ' A compra ainda não está disponível.' }

export const COVER_ALT = 'Capa do PDF Pede assim pra IA: mensagens pra hóspedes, da Lia da Hospedagem'

/** Situation 4 of the PDF. The instruction must equal its `prompt` in instructions.json (content.test.ts). */
export const EXAMPLE = {
  kicker: 'Exemplo · Situação 4',
  title: '“Posso chegar mais cedo?”',
  intro: 'Você quer responder com carinho. Mas ainda não sabe se a limpeza vai terminar a tempo.',
  guestKicker: 'O que chegou',
  guestMessage: '“Oi! Nosso ônibus chega às 10h. Dá pra entrar no quarto às 11h?”',
  guestNote: 'O check-in é às 14h. Você ainda vai ver se a limpeza libera o quarto antes.',
  draftKicker: 'Ficou assim · rascunho da IA',
  draft:
    '“Oi! Tudo bem? 😊 Nosso horário normal de check-in é às 14h, mas vou verificar se conseguimos liberar o quarto antes, às 11h. Te dou um retorno até as 10h30, combinado?”',
  checkLead: 'Confere antes de mandar:',
  check:
    ' o horário da reserva tá certo? A limpeza consegue liberar o quarto? Se ainda estiver verificando, dá um prazo que você consegue cumprir.',
  caption: 'Exemplo com dados fictícios. A resposta da IA pode variar: você confere os fatos e decide o que mandar.',
  disclosure: 'Ver o pedido pra IA dessa situação',
  instruction: `Mensagem do hóspede: [cole a mensagem].
Check-in da reserva: [horário normal].
Minha decisão: [liberar a partir de um horário, manter o horário normal ou ainda verificar].
Retorno, se eu ainda estiver verificando: [quando consigo dar notícias].
Alternativa ou condição já confirmada (opcional): [o que posso oferecer e em que condições].

Escreve uma única resposta curta e gentil, em português do Brasil, pro canal da reserva. Se eu ainda estiver verificando e o campo de retorno estiver vazio, pergunta quando posso dar notícias e espera antes de escrever. Se eu já tiver informado o prazo, mantém o horário normal por enquanto e diz que vou dar notícias no prazo, mesmo que a decisão continue em aberto. Só confirma um horário ou uma condição que eu já aprovei. Deixa de fora o campo opcional em branco. Se faltar informação necessária, me pergunta antes.

Usa só as informações que eu passei. Se faltar um dado necessário que depende de mim, me pergunta e espera minha resposta antes de escrever a mensagem. Pode deixar de fora os campos opcionais que estiverem em branco.`,
  fields:
    'Nesse exemplo, os [colchetes] foram preenchidos assim: check-in às 14h, decisão “ainda verificar”, retorno até as 10h30, sem alternativa.',
}

export const PDF_CONTENTS = {
  kicker: 'O que vem no PDF',
  title: 'Abre na situação que você precisa resolver.',
  intro: 'Um pedido pra IA por situação. Você preenche com os dados da sua reserva e a IA escreve um rascunho.',
  benefits: [
    {
      icon: 'phone',
      title: 'Feito pro celular',
      text: 'Um PDF de 15 páginas pra abrir no celular, direto na situação. Cada pedido tem um botão pra copiar.',
    },
    {
      icon: 'check',
      title: 'Testado no ChatGPT grátis',
      text: 'As 12 instruções foram testadas na versão gratuita do ChatGPT. Não precisa pagar outra ferramenta.',
    },
    {
      icon: 'search',
      title: 'Você confere antes de mandar',
      text: 'A IA escreve o rascunho. Você confere os fatos, ajusta o que quiser e manda do seu jeito.',
    },
  ],
  insideTitle: 'Em cada situação',
  inside: [
    { lead: 'O que chegou:', text: ' um exemplo da mensagem do hóspede' },
    { lead: 'Pede assim pra IA:', text: ' o pedido, com o que preencher entre [colchetes]' },
    { lead: 'Ficou assim:', text: ' um exemplo do que a IA respondeu' },
    { lead: 'Confere antes de mandar:', text: ' o que olhar antes de enviar' },
  ],
  situationsTitle: 'As 12 situações',
  situationsIntro: 'Da primeira pergunta antes da reserva à resposta da avaliação.',
} as const

/** The PDF's order; titles 10–12 are shortened from the PDF's “Responder a uma avaliação…”. */
export const SITUATIONS = [
  ['Pedido de desconto', 'Quando a pessoa pede um valor menor antes de reservar.'],
  ['Como chegar', 'Quando perguntam como chegar ou onde estacionar.'],
  ['Boas-vindas e chegada', 'As primeiras orientações antes da chegada, sem mandar o código real da porta.'],
  ['Check-in mais cedo', 'Quando a pessoa pede pra entrar antes do horário.'],
  ['Check-out mais tarde', 'Quando o hóspede pede pra ficar depois do horário de saída.'],
  ['Pedido para levar pet', 'Quando perguntam se podem levar um animal.'],
  ['Reclamação de barulho', 'Quando a pessoa avisa que o barulho tá atrapalhando a estadia.'],
  ['Lembrete de check-out', 'O horário de saída e o que fazer antes de ir.'],
  ['Pedido de avaliação', 'Depois da estadia, um convite leve pra uma avaliação sincera, sem pedir nota.'],
  ['Avaliação de 5 estrelas', 'Pra agradecer em público.'],
  ['Avaliação de 4 estrelas', 'Pra responder em público, com ou sem comentário.'],
  ['Avaliação negativa', 'Pra responder em público só com o que você pode confirmar.'],
] as const

export const HOW_TO_USE = {
  kicker: 'Como usar',
  title: 'Copia, preenche, confere e manda.',
  steps: [
    [
      'Copia o pedido',
      'Escolhe a situação e copia o bloco “Pede assim pra IA”. O primeiro, do desconto, vem preenchido pra você ver como fica.',
    ],
    [
      'Coloca os dados da reserva',
      'Troca o que está entre [colchetes] e cola no ChatGPT. Se a IA te fizer uma pergunta, responde ali primeiro.',
    ],
    ['Confere antes de mandar', 'Revisa os fatos, ajusta o tom e manda pelo mesmo canal da reserva.'],
  ],
  prerequisites:
    'Você precisa abrir o PDF, acessar o ChatGPT e copiar e colar textos. Não precisa conectar Airbnb, Booking ou WhatsApp. Antes de colar a mensagem do hóspede, tira sobrenome, telefone, número da reserva e código de acesso.',
} as const

export const FOOTER = {
  credit: 'Lia da Hospedagem · criado por Jamile Radloff · ',
  instagram: '@liadahospedagem',
  disclosure: '🤖 A Lia é uma personagem criada com IA.',
  terms: 'Suporte, reembolso e termos de compra: a confirmar.',
}
