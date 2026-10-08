import { INSTAGRAM_URL } from '../content'

export function Footer() {
  return (
    <footer className="site-footer">
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
        @liadahospedagem
      </a>
      <p>Sou uma personagem criada com IA. As mensagens foram escritas por uma pessoa de verdade, com carinho e sem “Prezado hóspede”.</p>
      <p>Sem cadastro e sem cookies. Só contamos visitas e cliques, de forma anônima.</p>
    </footer>
  )
}
