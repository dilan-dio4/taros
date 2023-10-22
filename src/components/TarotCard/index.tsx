import { ComponentWithAs, PropsWithAs } from "../../utils/as";
import styles from "./styles.module.css";

type TarotCardProps = {
    backgroundUrl: string,
}

type TarotCardComponent = ComponentWithAs<TarotCardProps, "div">

export const cardHeight = 380;
export const cardWidth = 200;

export const TarotCard: TarotCardComponent = (props: Parameters<TarotCardComponent>[0]) => {
    const { as: Type = "div", backgroundUrl, ...rest } = props;
    return (
        <Type
            {...rest}
            className={styles.card}
            style={{
                height: cardHeight,
                width: cardWidth,
                ...rest.style
            }}
        >
            <div>
                Front
            </div>
            <div style={{ backgroundImage: `url(${backgroundUrl})`, }} />
        </Type>
    )
}