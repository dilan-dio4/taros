import { ComponentWithAs, PropsWithAs } from "../../utils/as";
import styles from "./styles.module.css";
import noise from "../../assets/nnnoise.svg"
import clsx from "clsx";

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
                <div
                    style={{ backgroundImage: `url(${noise})`, }}
                    className={clsx(
                        "h-[calc(100%-12px)] w-[calc(100%-12px)]",
                        "translate-x-[6px] translate-y-[6px] rounded-[6px]",
                        "ring-[#333] ring-[2px]"
                    )}
                />
            </div>
            <div
                className={styles["card--face"]}
                style={{ backgroundImage: `url(${backgroundUrl})`, }}
            />
        </Type>
    )
}