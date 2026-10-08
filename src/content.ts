// Message copy. Must match the PDF (pdf/build.py).
// `id` is the stable English identifier used in analytics.
// `anchor` is the user-facing URL fragment (/mensagens#boasvindas), also used by the PDF links,
// so it stays in Portuguese to match the WhatsApp shortcut the host saves.

export type MessageId = 'welcome' | 'early-checkin' | 'checkout'
export type MessageAnchor = 'boasvindas' | 'cedo' | 'checkout'

export type Message = {
  readonly id: MessageId
  readonly anchor: MessageAnchor
  readonly title: string
  readonly subtitle: string
  readonly whenToSend: string
  readonly shortcut: string
  readonly text: string
  readonly tip: string
}

/** Every message, keyed by its id; each entry's `id` must match its key. */
type MessagesById = { readonly [Id in MessageId]: Message & { readonly id: Id } }

export const MESSAGE_BY_ID = {
  welcome: {
    id: 'welcome',
    anchor: 'boasvindas',
    title: 'Boas-vindas e chegada',
    subtitle: 'a que você mais manda',
    whenToSend: 'na véspera ou no dia da chegada.',
    shortcut: '/boasvindas',
    text: `Oi, [nome do hóspede]! 😊 Aqui é [seu nome], da [sua hospedagem]. Que bom que você vem para [cidade]!

Já deixo aqui as informações para sua chegada:

🕒 Check-in a partir das [horário].
🔑 [como entrar — ex.: a chave fica no cofre ao lado da porta. Te envio a senha no dia da chegada.]
🚗 [onde estacionar — apague esta linha se não se aplicar]
📶 Wi-Fi: [nome da rede] · senha: [senha]
💡 Uma dica minha: [ex.: a padaria da esquina abre às 6h]

Se tiver alguma dúvida, é só me chamar por aqui. Boa viagem!

[seu nome]`,
    tip: 'A senha do Wi-Fi já vai aqui, porque é a pergunta que mais chega. E não pula a dica: a padaria que abre cedo, o lugar do pôr do sol. É isso que faz a mensagem parecer sua, e não de robô.',
  },
  'early-checkin': {
    id: 'early-checkin',
    anchor: 'cedo',
    title: '“Posso chegar mais cedo?”',
    subtitle: 'dizer não sem fechar a porta',
    whenToSend: 'quando o hóspede pede para entrar antes do horário.',
    shortcut: '/cedo',
    text: `Oi, [nome do hóspede]! Nosso check-in começa às [horário], porque antes disso estamos preparando tudo para receber você.

Se a hospedagem ficar pronta mais cedo, te aviso por aqui para você poder entrar antes. 😊

[Opcional, se puder guardar bagagens: Enquanto isso, você pode deixar as malas com a gente e aproveitar o dia.]

[seu nome]`,
    tip: 'Não tem onde guardar mala? Apaga a linha opcional. E não promete horário antes de saber se a limpeza termina: “te aviso por aqui se você puder entrar antes” é melhor do que “pode vir ao meio-dia”.',
  },
  checkout: {
    id: 'checkout',
    anchor: 'checkout',
    title: 'Lembrete de check-out',
    subtitle: 'sem parecer que você tá expulsando o hóspede',
    whenToSend: 'na noite anterior à saída.',
    shortcut: '/checkout',
    text: `Oi, [nome do hóspede]! 😊 Espero que esteja curtindo a estadia na [sua hospedagem].

Passando para lembrar que amanhã o check-out é até as [horário], para a gente preparar tudo para os próximos hóspedes.

Antes de sair, por favor:
• [onde deixar a chave]
• [outra orientação de saída, se houver]
• [ex.: desligar o ar-condicionado e as luzes]

Foi um prazer receber você! Aproveite o restante da estadia e boa viagem de volta. 👋

[seu nome]`,
    tip: 'Explicar o motivo do horário ajuda o hóspede a entender o lembrete. Peça só o necessário para a saída e mantenha o carinho no final: “Foi um prazer receber você” faz diferença.',
  },
} as const satisfies MessagesById

/** Display order (pages, contents list, "Mensagem N de 3"). Reordering it does not change any lookup by id. */
export const MESSAGES: readonly Message[] = [MESSAGE_BY_ID.welcome, MESSAGE_BY_ID['early-checkin'], MESSAGE_BY_ID.checkout]

// In the published preview the PDF is not hosted, so the link only shows the tip.
export const PDF_URL = import.meta.env.VITE_PREVIEW === '1' ? '#pdf' : '/lia-3-mensagens.pdf'
export const TALLY_URL = 'https://tally.so/r/9qzR1Q'
export const INSTAGRAM_URL = 'https://www.instagram.com/liadahospedagem/'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jamileradloff/'
