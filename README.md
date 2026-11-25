# Tung Sahur Escape Gaem — v0.5

Versão híbrida do jogo: **jogabilidade e sprites do original** com as **novidades do v0.03** (vila, diálogos, HUD, taco de baseball/congelamento e telas de resultado).

Feito em HTML, CSS e JavaScript puro — sem build, sem dependências e sem frameworks.

## Como jogar

Basta abrir `index.html` no navegador. Se preferir servir os arquivos localmente:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

1. No menu, escolha **Jogar** (missão) ou **Infinite Mode**.
2. Após o carregamento, você começa na **vila**: ande com as setas/WASD até o **Carlinhos**.
3. Pressione **X** perto dele para abrir o diálogo e iniciar a **Fase 1**.
4. Na arena, colete maçãs para subir de nível e derrote os dois chefes.

### Controles

| Tecla | Ação |
| --- | --- |
| `Setas` / `WASD` | Andar na vila / mudar a direção na arena |
| `X` | Interagir com o Carlinhos e avançar diálogos |
| `F` | Usar o bastão (congela inimigos/chefes por 5s) |
| Qualquer tecla ou clique **após morrer** | Reiniciar no nível 1 |

Na arena o personagem continua andando na última direção escolhida — comportamento do jogo original.

## Conteúdo

### Do jogo original
- Arena 800×500 com inimigos perseguidores e maçãs.
- Chefes nos níveis 5 e 12 (5 e 10 maçãs), com músicas próprias.
- Sprites: `a.webp` (jogador), `b.webp` (inimigos), `c.webp` (maçã), `d.webp` (bastão), `boss.webp` e `boss2.jpeg` (chefes), `a.jpg` (game over).
- Bastão com 3 usos por luta de chefe.

### Do v0.03
- Menu com **Jogar**, **Infinite Mode** e modal **Mais**.
- Tela de carregamento com vídeo e barra de progresso.
- Vila com NPC Carlinhos, aviso de interação e sistema de diálogo.
- HUD com nível, maçãs, usos do bastão e barra de vida da gangue de Skibidi Toilets.
- Congelamento com contador `❄️ 5 ❄️` e efeito visual nos inimigos.
- Tela de **Missão Completa** (com opção **Continuar Infinito**) e **Game Over** com botão RESET.

Sol, lua e ciclo dia/noite foram removidos; o fundo muda apenas durante as lutas dos chefes.

## Estrutura do repositório

```
.
├── index.html          # menu principal
├── style.css           # estilo do menu
├── jogo/
│   ├── index.html      # vila + arena + HUD + overlays
│   ├── style.css       # estilo da vila e da arena
│   └── script.js       # lógica da vila e da arena
├── README.md
└── assets (raiz)       # imagens, áudios e vídeo usados pelo jogo
```

Arquivos de mídia das versões anteriores que não são usados na v0.5 (`prot.jfif`, `maça.jfif`, `skibid.webp`, `taco.jpg`, `over.png`, `boss2.webp`) foram mantidos na raiz para referência futura.

## Upload no GitHub

A pasta já contém um repositório Git inicializado na branch `main`. Após configurar seu usuário:

```bash
git add .
git commit -m "Tung Sahur Escape Gaem v0.5"
git remote add origin https://github.com/<seu-usuario>/<seu-repositorio>.git
git push -u origin main
```
