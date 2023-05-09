import { SnakeGameProps } from "./SnakeGame.props";
import styles from "./SnakeGame.module.scss";
import cn from "classnames";
import {
  RxTriangleUp,
  RxTriangleDown,
  RxTriangleLeft,
  RxTriangleRight,
} from "react-icons/rx";
import boltSvg from '../../assets/bolt.svg'
import { SnakeCanvas } from "../SnakeCanvas/SnakeCanvas";
import { useState } from "react";

export const SnakeGame = ({
  className,
  ...props
}: SnakeGameProps): JSX.Element => {
  const initialFoodCount: number = 10;
  const [foodCount, setFoodCount] = useState<number>(10);
  return (
    <div className={cn(styles.container, className)} {...props}>
      <div className={cn(styles.bolts)}>
        <div className={cn(styles.bolt)}>
          <img src={boltSvg} alt="bolt icon" />
        </div>
        <div className={cn(styles.bolt)}>
          <img src={boltSvg} alt="bolt icon" />
        </div>
      </div>

      <div className={cn(styles.content)}>
        <div className={cn(styles.canvas)}>
          <SnakeCanvas
            initialCount={initialFoodCount}
            foodCount={foodCount}
            setFoodCount={setFoodCount}
          />
        </div>
        <div className={cn(styles.information)}>
          <div className={cn(styles.information_block)}>
            <div className={cn(styles.text)}>{"//use keyboard"}</div>
            <div className={cn(styles.text)}>{"//arrows to play"}</div>
            <div className={cn(styles.arrow_items)}>
              <div className={cn(styles.arrow_item)}>
                <RxTriangleUp />
              </div>
            </div>
            <div className={cn(styles.arrow_items)}>
              <div className={cn(styles.arrow_item)}>
                <RxTriangleLeft />
              </div>
              <div className={cn(styles.arrow_item)}>
                <RxTriangleDown />
              </div>
              <div className={cn(styles.arrow_item)}>
                <RxTriangleRight />
              </div>
            </div>
          </div>
          <div className={cn(styles.text)}>{"//food left"}</div>
          <div className={cn(styles.apples)}>
            {Array.from(
              { length: initialFoodCount },
              (_, i) => i >= foodCount
            ).map((el, i) => (
              <div
                className={cn(styles.apples_item, {
                  [styles.apples_item_active]: el,
                })}
                key={i}
              ></div>
            ))}
          </div>
        </div>
      </div>
      <div className={cn(styles.bolts)}>
        <div className={cn(styles.bolt)}>
          <img src={boltSvg} alt="bolt icon" />
        </div>
        <div className={cn(styles.bolt)}>
          <img src={boltSvg} alt="bolt icon" />
        </div>
      </div>
    </div>
  );
};
