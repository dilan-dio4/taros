import { ComponentWithAs } from "../../utils/as";
import styles from "./styles.module.css";
import noise from "../../assets/nnnoise.svg"
import clsx from "clsx";

type TarotCardProps = {
    backgroundUrl: string,
    glowColor?: string,
}

type TarotCardComponent = ComponentWithAs<TarotCardProps, "div">

export const cardHeight = 380;
export const cardWidth = 200;

export const TarotCard: TarotCardComponent = (props: Parameters<TarotCardComponent>[0]) => {
    const { as: Type = "div", backgroundUrl, glowColor, ...rest } = props;
    return (
        <Type
            {...rest}
            className={clsx(styles.card, glowColor && styles["card--glow"])}
            style={{
                height: cardHeight,
                width: cardWidth,
                boxShadow: glowColor ?
                    `0 0 30px 10px ${glowColor}`
                    :
                    '0 12.5px 100px -10px rgba(50, 50, 73, 0.4), 0 10px 10px -10px rgba(50, 50, 73, 0.3)'
                    ,
                ...rest.style
            }}
        >
            <div>
                <div
                    style={{
                        backgroundImage: `url(${noise})`,
                        backgroundSize: "70px 70px",
                    }}
                    className={clsx(
                        "h-[calc(100%-12px)] w-[calc(100%-12px)]",
                        "translate-x-[6px] translate-y-[6px] rounded-[6px]",
                        "ring-[#333] ring-[2px] bg-repeat"
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