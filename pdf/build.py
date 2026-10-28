# Builds "o Caderninho da Lia" (the free PDF) from HTML.
# Static font instances (fontTools) keep the PDF text copyable.
import html, re, asyncio
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parent / "public" / "lia-3-mensagens.pdf"  # always the same name so links never break
from playwright.async_api import async_playwright

SITE = "https://liadahospedagem.pages.dev"
IG = "https://www.instagram.com/liadahospedagem/"
TALLY = "https://tally.so/r/9qzR1Q?origin=pdf"
LINKEDIN = "https://www.linkedin.com/in/jamileradloff/"
def messages_url(anchor=""):
    return f"{SITE}/mensagens?utm_source=pdf" + (f"#{anchor}" if anchor else "")

COPYICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
BOOK = '<span class="book"></span>'

def footer(n, dark=False):
    return f'<div class="foot{" dark" if dark else ""}"><a class="ig" href="{IG}">{BOOK}@liadahospedagem</a><span>{n}/8</span></div>'

def bubble(text):
    """Message text -> paragraphs, with [placeholders] highlighted."""
    paragraphs=[]
    for para in text.strip().split("\n\n"):
        lines=[]
        for line in para.split("\n"):
            escaped=html.escape(line)
            escaped=re.sub(r"(\[[^\]]+\])", r'<span class="fill">\1</span>', escaped)
            lines.append(escaped)
        paragraphs.append("<p>"+"<br>".join(lines)+"</p>")
    return '<div class="bubble">'+"".join(paragraphs)+'<div class="tick">✓✓</div></div>'

MESSAGES=[
 dict(anchor="boasvindas", number=1, title="Boas-vindas e chegada", when="na véspera ou no dia da chegada.", shortcut="/boasvindas",
  text="""Oi, [nome do hóspede]! 😊 Aqui é [seu nome], da [sua hospedagem]. Que bom que você vem para [cidade]!

Já deixo aqui as informações para sua chegada:

🕒 Check-in a partir das [horário].
🔑 [como entrar — ex.: a chave fica no cofre ao lado da porta. Te envio a senha no dia da chegada.]
🚗 [onde estacionar — apague esta linha se não se aplicar]
📶 Wi-Fi: [nome da rede] · senha: [senha]
💡 Uma dica minha: [ex.: a padaria da esquina abre às 6h]

Se tiver alguma dúvida, é só me chamar por aqui. Boa viagem!

[seu nome]""",
  tip="A senha do Wi-Fi já vai aqui, porque é a pergunta que mais chega. E não pula a dica: a padaria que abre cedo, o lugar do pôr do sol. É isso que faz a mensagem parecer sua, e não de robô."),
 dict(anchor="cedo", number=2, title="“Posso chegar mais cedo?”", when="quando o hóspede pede para entrar antes do horário.", shortcut="/cedo",
  text="""Oi, [nome do hóspede]! Nosso check-in começa às [horário], porque antes disso estamos preparando tudo para receber você.

Se a hospedagem ficar pronta mais cedo, te aviso por aqui para você poder entrar antes. 😊

[Opcional, se puder guardar bagagens: Enquanto isso, você pode deixar as malas com a gente e aproveitar o dia.]

[seu nome]""",
  tip="Não tem onde guardar mala? Apaga a linha opcional. E não promete horário antes de saber se a limpeza termina: “te aviso por aqui se você puder entrar antes” é melhor do que “pode vir ao meio-dia”."),
 dict(anchor="checkout", number=3, title="Lembrete de check-out", when="na noite anterior à saída.", shortcut="/checkout",
  text="""Oi, [nome do hóspede]! 😊 Espero que esteja curtindo a estadia na [sua hospedagem].

Passando para lembrar que amanhã o check-out é até as [horário], para a gente preparar tudo para os próximos hóspedes.

Antes de sair, por favor:
• [onde deixar a chave]
• [outra orientação de saída, se houver]
• [ex.: desligar o ar-condicionado e as luzes]

Foi um prazer receber você! Aproveite o restante da estadia e boa viagem de volta. 👋

[seu nome]""",
  tip="Explicar o motivo do horário ajuda o hóspede a entender o lembrete. Peça só o necessário para a saída e mantenha o carinho no final: “Foi um prazer receber você” faz diferença."),
]

pages=[]

# 1. Cover
pages.append(f'''<section class="page cover">
<div class="brandrow">{BOOK}o Caderninho da Lia</div>
<div class="covermid">
<h1>3 mensagens prontas para você parar de digitar a mesma coisa todo dia</h1>
<p class="lead">Copia, troca o que está entre colchetes e salva como atalho no WhatsApp. Em 10 minutos, tá feito.</p>
</div>
<div class="hand big">Grátis e com carinho, Lia.</div>
{footer(1, True)}</section>''')

# 2. Before you start (+ AI disclosure)
pages.append(f'''<section class="page">
<div class="kicker">Antes de começar</div>
<h2>Oi, eu sou a Lia.</h2>
<p class="disclose">Sou uma personagem criada com IA, e as mensagens foram escritas por uma pessoa de verdade.</p>
<div class="qbox">
<div class="liabadge">Lia<span class="dot"></span></div>
<div class="kicker">Anota essa</div>
<div class="quote">Se você responde a senha do Wi-Fi toda semana,<br>o problema não é o hóspede.<br>É o processo.</div>
<div class="sig"><span class="line"></span><a href="{IG}">@liadahospedagem</a></div>
</div>
<p>Hóspede não lê manual, ele pergunta. E você? Responde de novo do mercado, do carro, às 11 da noite...</p>
<p><b>Não dá para fazer o hóspede parar de perguntar, mas dá para parar de digitar.</b></p>
<ol class="toc">
<li><b>Boas-vindas e chegada</b><span>a que você mais manda</span></li>
<li><b>“Posso chegar mais cedo?”</b><span>dizer não sem fechar a porta</span></li>
<li><b>Lembrete de check-out</b><span>sem parecer que você tá expulsando o hóspede</span></li>
</ol>
{footer(2)}</section>''')

# 3-5. Messages
for m in MESSAGES:
    pages.append(f'''<section class="page">
<div class="kicker">Mensagem {m["number"]} de 3</div>
<h2>{html.escape(m["title"])}</h2>
<p class="when"><b>Quando mandar:</b> {m["when"]}</p>
{bubble(m["text"])}
<div class="row"><a class="copybtn" href="{messages_url(m["anchor"])}">{COPYICON}<span>Toca aqui para copiar</span></a><span class="shortcut">Atalho: <code>{m["shortcut"]}</code></span></div>
<div class="tip"><div class="hand">Dica da Lia</div><p>{html.escape(m["tip"])}</p></div>
{footer(m["number"]+2)}</section>''')

# 6. WhatsApp Business setup
pages.append(f'''<section class="page">
<div class="kicker">10 minutos</div>
<h2>Agora salva no WhatsApp Business</h2>
<ol class="steps">
<li>Abre o WhatsApp Business e procura <b>Ferramentas</b> ou <b>Ferramentas comerciais</b>. Depois, toca em <b>Respostas rápidas</b>. O caminho pode variar conforme o celular e a versão do aplicativo.</li>
<li>Toca em <b>+</b> e cola a mensagem. Substitui os campos entre colchetes pelos dados da sua hospedagem e apaga as orientações que não se aplicam. Deixa só <b>[nome do hóspede]</b> para preencher antes de enviar.</li>
<li>Escolhe um atalho simples, como <b>boasvindas</b>, <b>cedo</b> ou <b>checkout</b>, e toca em <b>Salvar</b>. Repete esses passos para as três mensagens.</li>
<li>Para usar, abre a conversa, digita <b>/</b> e seleciona a resposta. Troca [nome do hóspede] pelo nome da pessoa, confere a mensagem e envia.</li>
</ol>
<div class="center"><a class="copybtn" href="{messages_url()}">{COPYICON}<span>Abrir as 3 mensagens para copiar no celular</span></a></div>
{footer(6)}</section>''')

# 7. What next (paid kit preview)
phone_msg = """Oi, [nome do hóspede]! 😊 Aqui é Renata, dos Estúdios do Campeche. Que bom que você vem para Florianópolis!

Já deixo aqui as informações para sua chegada:

🕒 Check-in a partir das 14h.
🔑 A chave fica no cofre ao lado do portão de madeira. Te envio a senha no dia da chegada.
🚗 Vaga coberta na garagem, a primeira à esquerda.
📶 Wi-Fi: Campeche_Hospedes · senha: praia2026
💡 Uma dica minha: a padaria Pão da Ilha abre às 6h.

Se tiver alguma dúvida, é só me chamar por aqui. Boa viagem!

Renata"""
def phone_bubble(t):
    paragraphs=[]
    for para in t.split("\n\n"):
        paragraphs.append("<p>"+"<br>".join(re.sub(r"(\[[^\]]+\])", r'<span class="pfill">\1</span>', html.escape(l)) for l in para.split("\n"))+"</p>")
    return "".join(paragraphs)

pages.append(f'''<section class="page">
<div class="kicker">E agora?</div>
<h2>Suas 3 mensagens já estão prontas. E as outras situações?</h2>
<div class="two-col">
<div class="phone"><div class="notch"></div>
<div class="pstatus"><span>9:41</span><span class="bars"></span></div>
<div class="phead">{BOOK}<div><b>Suas mensagens</b><small>Estúdios do Campeche</small></div><span class="pcount">1 de 12</span></div>
<div class="ptabs"><span class="on">Português</span><span>Español</span><span>English</span></div>
<div class="pcard"><b class="ptitle">Boas-vindas e chegada</b><small>Manda na véspera ou no dia da chegada.</small>
<div class="pbubble">{phone_bubble(phone_msg)}</div>
<span class="pcopy">{COPYICON} Copiar mensagem</span></div>
<div class="phome"></div></div>
<div class="side">
<p>Agora imagina responder algumas perguntas sobre a sua hospedagem <b>uma vez só</b> e receber as 12 mensagens adaptadas com seus dados: horários, instruções de entrada, Wi-Fi e regras da casa.</p>
<p>Em português, para você conferir, copiar e usar. Espanhol e inglês chegam depois.</p>
<div class="hand example">exemplo: Estúdios do Campeche, Florianópolis</div>
</div></div>
<div class="assist">
<div class="atext"><div class="hand">chega de 'Prezado hóspede':</div>
<h3>Um assistente que responde do seu jeito</h3>
<p>Você coloca no <b>ChatGPT</b> ou no <b>Claude</b> uma vez só. Chegou uma pergunta nova? Ele escreve a resposta com o seu tom e pede sua confirmação antes de oferecer desconto, mudar horários ou autorizar pets.</p></div>
<div class="amock"><div class="astep"><span class="num">1</span><b>Coloca seu assistente na IA</b></div>
<div class="aseg"><span class="on">ChatGPT</span><span>Claude</span></div>
<div class="abar"></div><div class="abar short"></div>
<div class="astep dim"><span class="num">2</span><span class="abar flex"></span></div></div>
</div>
{footer(7)}</section>''')

# 8. Waitlist
pages.append(f'''<section class="page cover last">
<div class="kicker light">Tô preparando o resto</div>
<h2 class="light">Essas são 3 de 12 mensagens.</h2>
<p class="light">O caderninho completo cobre a estadia inteira, da reserva à avaliação. Estou montando com calma. Quer o caderninho completo quando ficar pronto? Deixa seu e-mail: quem está na lista fica sabendo primeiro e ganha o preço especial de lançamento.</p>
<div class="highlight"><b>Um assistente que responde do seu jeito.</b> Você coloca no ChatGPT ou no Claude uma vez só. Chegou uma pergunta nova? Ele escreve a resposta no seu tom e pede sua confirmação antes de oferecer desconto, mudar horário ou autorizar pet.</div>
<ul class="checks">
<li>As 3 daqui e mais 9: pedido de desconto, pets, barulho, saída mais tarde, orientações de chegada e resposta de avaliação.</li>
<li>O assistente responde hóspede de fora no idioma dele. As mensagens em espanhol e inglês chegam depois, de graça pra quem comprar no lançamento.</li>
<li>Para 1 propriedade, com os dados da sua casa.</li>
</ul>
<a class="btn" href="{TALLY}">Me avisa quando sair!</a>
<div class="hand light center note">É opcional e leva 1 minuto, prometo.</div>
<div class="tag">Automatize o repetitivo.<br>Não automatize o carinho.</div>
<div class="credit">Criado por <a href="{LINKEDIN}">Jamile Radloff</a></div>
{footer(8, True)}</section>''')

CSS = (HERE / "style.css").read_text()
(HERE / "notebook.html").write_text(f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>o Caderninho da Lia · 3 mensagens prontas</title><style>{CSS}</style></head><body>{"".join(pages)}</body></html>', encoding="utf-8")

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":540,"height":864})
        await pg.goto((HERE / "notebook.html").as_uri()); await pg.wait_for_timeout(1000)
        overflow = await pg.evaluate("""[...document.querySelectorAll('.page')].map((s,i)=>{const f=s.querySelector('.foot');const children=[...s.children].filter(c=>!c.classList.contains('foot'));const bottom=Math.max(...children.map(c=>c.getBoundingClientRect().bottom))-s.getBoundingClientRect().top;return [i+1, Math.round(bottom)]})""")
        print("content bottom per page (px, limit ~800):", overflow)
        await pg.pdf(path=str(OUTPUT), width="540px", height="864px", print_background=True)
        await b.close()
asyncio.run(main())
