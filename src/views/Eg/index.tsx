import { useRef, useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styles from "./styles.module.css"
import { TarotCard, cardHeight, cardWidth } from '../../components/TarotCard'
import { shuffle, random } from 'lodash-es';

const cardsImgs = [
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/690px-RWS_Tarot_02_High_Priestess.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
]

const cardXCenter = window.innerWidth / 2 - cardWidth / 2;

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const inDeckPosition = (i: number) => ({
    x: cardXCenter,
    y: window.innerHeight - (cardHeight) + (i * -4),
    scale: 1,
    angle: 30,
    flip: 0,
    rot: random(-10, 10, true),
})

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, a: number, f: number, s: number) =>
    `perspective(1500px) rotateX(${a}deg) rotateY(${f || r / 10}deg) rotateZ(${r}deg) scale(${s})`

type Card = {
    value: number;
    state: "inDeck" | "highlighted-flipped" | "highlighted" | "inPlay" | "discarded";
    backgroundUrl: string;
}

const N_CARDS = 12 // 78

export function Eg() {
    const [highlightedCard, setHighlightedCard] = useState<number>()
    const cards = useRef<Card[]>(shuffle(Array.from({ length: N_CARDS }, (_, i) => ({
        value: i,
        state: "inDeck",
        backgroundUrl: cardsImgs[i % cardsImgs.length],
    } as const))))

    const [props, api] = useSprings(cards.current.length, i => ({
        to: inDeckPosition(i),
        from: { x: cardXCenter, angle: 30, rot: 0, scale: 1.5, y: -1000, flip: 0 },
        delay: i * 100,
    }))

    const bind = useDrag(({ args: [index], down, movement: [mx, my], direction: [xDir, yDir], velocity: [xVel, yVel] }) => {

        if (!down) {
            if (cards.current[index].state === "inDeck") {
                const triggerHighlight = yVel > 0.2 && yDir < 0;
                const triggerDiscard = xVel > 0.2;
                if (triggerHighlight) {
                    cards.current[index].state = "highlighted"
                    setHighlightedCard(index)
                } else if (triggerDiscard) {
                    // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
                    cards.current[index].state = "discarded"
                }
            } else if (cards.current[index].state === "highlighted") {
                const triggerFlip = xVel > 0.2;
                const triggerDeck = yVel > 0.2 && yDir > 0;
                if (triggerFlip) {
                    cards.current[index].state = "highlighted-flipped"
                } else if (triggerDeck) {
                    setHighlightedCard(undefined)
                    cards.current[index].state = "inDeck"
                }
            } else if (cards.current[index].state === "highlighted-flipped") {
                const triggerPlay = yVel > 0.2 && yDir < 0;
                const triggerDeck = yVel > 0.2 && yDir > 0;
                const triggerFlip = xVel > 0.2;
                if (triggerPlay) {
                    cards.current[index].state = "inPlay"
                    setHighlightedCard(undefined)
                } else if (triggerFlip) {
                    cards.current[index].state = "highlighted"
                } else if (triggerDeck) {
                    setHighlightedCard(undefined)
                    cards.current[index].state = "inDeck"
                }
            }
        }

        const discardDir = xDir < 0 ? -1 : 1 // Direction should either point left or right
        api.start(i => {
            if (index !== i) {
                return;
            }

            const cardState = cards.current[index].state
            if (cardState === "discarded") {
                return {
                    to: {
                        x: (50 + cardWidth + window.innerWidth) * discardDir,
                        rot: mx / 100 + (discardDir * 10 * xVel),
                        scale: down ? 1.1 : 1,
                        config: { friction: 50, tension: down ? 800 : 200 },
                    }
                }
            } else if (cardState === "highlighted") {
                const startPos = inDeckPosition(i)
                const scaleSize = 1.5
                return {
                    to: {
                        x: startPos.x,
                        y: startPos.y - (cardHeight * scaleSize) / 2,
                        scale: scaleSize,
                        rot: 0,
                        angle: 0,
                        flip: 0,
                    }
                }
            } else if (cardState === "highlighted-flipped") {
                return {
                    flip: 180,
                }
            } else {
                const startPos = inDeckPosition(i)
                return {
                    to: {
                        x: down ? startPos.x + mx : startPos.x,
                        y: down ? startPos.y + my - 20 : startPos.y,
                        rot: mx / 100,
                        scale: down ? 1.1 : startPos.scale,
                        config: { friction: 50, tension: down ? 800 : 500 },
                        angle: 30,
                        flip: 0,
                    }
                }
            }
        })

        // If all cards are discarded
        if (!down && cards.current.every(card => card.state === "discarded")) {
            setTimeout(() => {
                cards.current.forEach(card => card.state = "inDeck")
                api.start(i => inDeckPosition(i))
            }, 600)
        }
    })

    return (
        <div className={styles.canvas}>
            {props.map(({ x, y, rot, scale, angle, flip, }, i) => (
                <animated.div className={styles["card-container"]} key={i} style={{ x, y }}>
                    {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
                    <TarotCard
                        as={animated.div}
                        {...bind(i)}
                        style={{
                            transform: interpolate([rot, angle, flip, scale], trans),
                        }}
                        backgroundUrl={cards.current[i].backgroundUrl}
                    />
                </animated.div>
            ))}
        </div>
    )

}
