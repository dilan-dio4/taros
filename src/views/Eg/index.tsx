import { useRef, useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styles from "./styles.module.css"
import { TarotCard, cardHeight, cardWidth } from '../../components/TarotCard'
import { shuffle } from 'lodash-es';

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
    rot: -10 + Math.random() * 20,
    delay: i * 100,
})

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
    `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

type Card = {
    value: number;
    state: "inDeck" | "highlighted" | "inPlay" | "discarded";
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
        ...inDeckPosition(i),
        from: { x: cardXCenter, rot: 0, scale: 1.5, y: -1000 },
    })) // Create a bunch of springs using the helpers above
    
    // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
    const bind = useDrag(({ args: [index], down, movement: [mx, my], direction: [xDir, yDir], velocity }) => {
        const Xtrigger = velocity[0] > 0.2 // If you flick hard enough it should trigger the card to fly out
        const Ytrigger = velocity[1] > 0.2
        
        if (!down) {
            if (Xtrigger) {
                // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
                cards.current[index].state = "discarded"
            } else if (Ytrigger && yDir < 0) {
                cards.current[index].state = "highlighted"
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
                    x: (50 + cardWidth + window.innerWidth) * discardDir,
                    rot: mx / 100 + (discardDir * 10 * velocity[0]),
                    scale: down ? 1.1 : 1,
                    config: { friction: 50, tension: down ? 800 : 200 },
                }
            } else if (cardState === "highlighted") {
                const startPos = inDeckPosition(i)
                const scaleSize = 1.5
                return {
                    x: startPos.x,
                    y: startPos.y - (cardHeight * scaleSize) / 2,
                    scale: scaleSize,
                    rot: 0,
                }
            } else {
                // return to deck
                const startPos = inDeckPosition(i)
                return {
                    x: down ? startPos.x + mx : startPos.x,
                    y: down ? startPos.y + my - 20 : startPos.y,
                    rot: mx / 100,
                    scale: down ? 1.1 : startPos.scale,
                    config: { friction: 50, tension: down ? 800 : 500 },
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
            {props.map(({ x, y, rot, scale }, i) => (
                <animated.div className={styles["card-container"]} key={i} style={{ x, y }}>
                    {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
                    <TarotCard
                        as={animated.div}
                        {...bind(i)}
                        style={{
                            transform: interpolate([rot, scale], trans),
                        }}
                        backgroundUrl={cards.current[i].backgroundUrl}
                    />
                </animated.div>
            ))}
        </div>
    )

}
