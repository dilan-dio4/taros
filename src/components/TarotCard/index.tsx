import { ComponentWithAs, PropsWithAs } from "../../utils/as";
import styles from "./styles.module.css";

type TarotCardProps = {
    backgroundUrl: string,
    foregroundUrl: string,
}

type TarotCardComponent = ComponentWithAs<TarotCardProps, "div">

export const TarotCard: TarotCardComponent = (props: PropsWithAs) => {
    const { as: Type = "div", backgroundUrl, ...rest } = props;
    return (
        <Type
            {...rest}
            className={styles.card}
            style={{
                backgroundImage: `url(${backgroundUrl})`,
                ...props.style,
            }}
        />
    )
}