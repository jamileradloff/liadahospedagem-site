import { TALLY_URL } from '../content'
import { track, waitlistUrl, type DeliveryPage } from '../analytics'

// Bridge to the paid kit (Tally waitlist). Always placed AFTER the messages are delivered.
export function WaitlistSection({ page }: { page: DeliveryPage }) {
  return (
    <section className="waitlist" aria-labelledby={`waitlist-title-${page}`}>
      <div className="waitlist__intro">
        <p className="handwritten handwritten--light">tô preparando o resto</p>
        <h2 id={`waitlist-title-${page}`}>Essas são 3 de 12 mensagens.</h2>
        <p>
          O caderninho completo cobre a estadia inteira, da reserva à avaliação. Estou montando com calma. Quer o
          caderninho completo quando ficar pronto? Deixa seu e-mail: quem está na lista fica sabendo primeiro e ganha o
          preço especial de lançamento.
        </p>
      </div>
      <div className="waitlist__body">
        <ul className="waitlist__items">
          <li className="waitlist__featured">
            <strong>Um assistente que responde do seu jeito.</strong> Você coloca no ChatGPT ou no Claude uma vez só.
            Chegou uma pergunta nova? Ele escreve a resposta no seu tom e pede sua confirmação antes de oferecer
            desconto, mudar horário ou autorizar pet.
          </li>
          <li>
            As 3 daqui e mais 9: pedido de desconto, pets, barulho, saída mais tarde, orientações de chegada e
            resposta de avaliação.
          </li>
          <li>
            O assistente responde hóspede de fora no idioma dele. As mensagens em espanhol e inglês chegam depois, de
            graça pra quem comprar no lançamento.
          </li>
          <li>Para 1 propriedade, com os dados da sua casa.</li>
        </ul>
        <a
          className="button button--large"
          href={waitlistUrl(TALLY_URL, page)}
          target="_blank"
          rel="noopener"
          onClick={() => track('clicked_waitlist', { page, placement: 'section' })}
        >
          Quero entrar na lista de lançamento
        </a>
        <p className="waitlist__note">É opcional e leva 1 minuto, prometo.</p>
      </div>
    </section>
  )
}
