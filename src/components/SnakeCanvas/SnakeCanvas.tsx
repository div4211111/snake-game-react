import { useEffect, useRef, useState } from "react";
import { SnakeCanvasProps } from "./SnakeCanvas.props";
import styles from "./SnakeCanvas.module.scss";
import cn from "classnames";
import { useSize } from "../../hooks/useSize";
import useInterval from "@use-it/interval/src/index";

type Apple = {
  x: number;
  y: number;
};

type Velocity = {
  dx: number;
  dy: number;
};

export const SnakeCanvas = ({
  className,
  foodCount,
  setFoodCount,
  initialCount,
  ...props
}: SnakeCanvasProps): JSX.Element => {
  // Canvas Settings
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef);
  const canvasGridSize = 10;

  // Game Settings
  const minGameSpeed = 10;
  const maxGameSpeed = 15;

  // Game State
  const [canvasWidth, setCanvasWidth] = useState<number>(240);
  const [canvasHeight, setCanvasHeight] = useState<number>(405);
  const [gameDelay, setGameDelay] = useState<number>(1000 / minGameSpeed);
  const [countDown, setCountDown] = useState<number>(4);
  const [running, setRunning] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<{
    head: { x: number; y: number };
    trail: Array<any>;
  }>({
    head: { x: 12, y: 9 },
    trail: [],
  });
  const [apple, setApple] = useState<Apple>({ x: -1, y: -1 });
  const [velocity, setVelocity] = useState<Velocity>({ dx: 0, dy: 0 });
  const [previousVelocity, setPreviousVelocity] = useState<Velocity>({
    dx: 0,
    dy: 0,
  });

  useEffect(() => {
    if (size) {
      setCanvasWidth(size.width);
      setCanvasHeight(size.height);
    }
  }, []);
  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(-1, -1, canvasWidth + 2, canvasHeight + 2);
  };

  const generateApplePosition = (): Apple => {
    const x = Math.floor(Math.random() * (canvasWidth / canvasGridSize));
    const y = Math.floor(Math.random() * (canvasHeight / canvasGridSize));
    // Check if random position interferes with snake head or trail
    if (
      (snake.head.x === x && snake.head.y === y) ||
      snake.trail.some((snakePart) => snakePart.x === x && snakePart.y === y)
    ) {
      return generateApplePosition();
    }
    return { x, y };
  };

  // Initialise state and start countdown
  const startGame = () => {
    setGameDelay(1000 / minGameSpeed);
    setIsLost(false);
    setIsLose(false);
    setIsWinner(false);
    setScore(0);
    setSnake({
      head: { x: 12, y: 9 },
      trail: [],
    });
    setApple(generateApplePosition());
    setVelocity({ dx: 0, dy: -1 });
    setRunning(true);
    setCountDown(3);
  };

  // Reset state and check for highscore
  const gameOver = () => {
    setIsLost(true);
    setIsLose(true);
    setRunning(false);
    setVelocity({ dx: 0, dy: 0 });
    setCountDown(4);
    setFoodCount(initialCount);
  };
  const gameWinner = () => {
    setIsWinner(true);
    setIsLost(true);
    setRunning(false);
    setVelocity({ dx: 0, dy: 0 });
    setCountDown(4);
    setFoodCount(initialCount);
  };

  const fillRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.fillRect(x, y, w, h);
    // ctx.beginPath();
    // ctx.roundRect(x, y, w, h, [20]);
    // ctx.fill();
  };

  const drawSnake = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(67, 217, 173, 1)";
    ctx.beginPath();
    ctx.roundRect(
      snake.head.x * canvasGridSize,
      snake.head.y * canvasGridSize,
      canvasGridSize,
      canvasGridSize,
      velocity.dx === -1
        ? [10, 0, 0, 10]
        : velocity.dx === 1
          ? [0, 10, 10, 0]
          : velocity.dy === -1
            ? [10, 10, 0, 0]
            : velocity.dy === 1
              ? [0, 0, 10, 10]
              : [10]
    );
    ctx.fill();
    ctx.closePath();

    snake.trail.forEach((snakePart, index, array) => {
      const c = 1 / array.length;
      ctx.fillStyle = `rgba(67, 217, 173, ${0 + c * index})`;

      fillRect(
        ctx,
        snakePart.x * canvasGridSize,
        snakePart.y * canvasGridSize,
        canvasGridSize,
        canvasGridSize
      );
    });
  };

  const drawApple = (ctx: CanvasRenderingContext2D) => {
    if (
      apple &&
      typeof apple.x !== "undefined" &&
      typeof apple.y !== "undefined"
    ) {
      ctx.beginPath();
      ctx.roundRect(
        apple.x * canvasGridSize,
        apple.y * canvasGridSize,
        canvasGridSize,
        canvasGridSize,
        [10]
      );
      ctx.fillStyle = "rgba(67, 217, 173, 1)";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.roundRect(
        apple.x * canvasGridSize - canvasGridSize / 2,
        apple.y * canvasGridSize - canvasGridSize / 2,
        canvasGridSize * 2,
        canvasGridSize * 2,
        [20]
      );
      ctx.fillStyle = "rgba(67, 217, 173, 0.2)";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.roundRect(
        apple.x * canvasGridSize - canvasGridSize,
        apple.y * canvasGridSize - canvasGridSize,
        canvasGridSize * 3,
        canvasGridSize * 3,
        [30]
      );
      ctx.fillStyle = "rgba(67, 217, 173, 0.1)";
      ctx.fill();
      ctx.closePath();
    }
  };

  // Update snake.head, snake.trail and apple positions. Check for collisions.
  const updateSnake = () => {
    // Check for collision with walls
    const nextHeadPosition = {
      x: snake.head.x + velocity.dx,
      y: snake.head.y + velocity.dy,
    };
    if (
      nextHeadPosition.x < 0 ||
      nextHeadPosition.y < 0 ||
      nextHeadPosition.x >= canvasWidth / canvasGridSize ||
      nextHeadPosition.y >= canvasHeight / canvasGridSize
    ) {
      gameOver();
    }

    // Check for collision with apple
    if (nextHeadPosition.x === apple.x && nextHeadPosition.y === apple.y) {
      setScore((prevScore) => prevScore + 1);
      setApple(generateApplePosition());
      if (foodCount === 1) {
        gameWinner();
      } else {
        setFoodCount((prev: number) => prev - 1);
      }
    }

    const updatedSnakeTrail = [...snake.trail, { ...snake.head }];
    // Remove trail history beyond snake trail length (score + 2)
    while (updatedSnakeTrail.length > score + 2) updatedSnakeTrail.shift();
    // Check for snake colliding with itsself
    if (
      updatedSnakeTrail.some(
        (snakePart) =>
          snakePart.x === nextHeadPosition.x &&
          snakePart.y === nextHeadPosition.y
      )
    )
      gameOver();

    // Update state
    setPreviousVelocity({ ...velocity });
    setSnake({
      head: { ...nextHeadPosition },
      trail: [...updatedSnakeTrail],
    });
  };

  // Game Hook
  useEffect(() => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext("2d");

    if (ctx && !isLost && running) {
      clearCanvas(ctx);
      drawApple(ctx);
      drawSnake(ctx);
    }
  }, [snake, velocity]);

  // Game Update Interval
  useInterval(
    () => {
      if (!isLost) {
        updateSnake();
      }
    },
    running && countDown === 0 ? gameDelay : null
  );

  // Countdown Interval
  useInterval(
    () => {
      setCountDown((prevCountDown) => prevCountDown - 1);
    },
    countDown > 0 && countDown < 4 ? 800 : null
  );

  // Score Hook: increase game speed starting at 16
  useEffect(() => {
    if (score > minGameSpeed && score <= maxGameSpeed) {
      setGameDelay(1000 / score);
    }
  }, [score]);

  // Event Listener: Key Presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        let velocity = { dx: 0, dy: 0 };

        switch (e.key) {
          case "ArrowRight":
            velocity = { dx: 1, dy: 0 };
            break;
          case "ArrowLeft":
            velocity = { dx: -1, dy: 0 };
            break;
          case "ArrowDown":
            velocity = { dx: 0, dy: 1 };
            break;
          case "ArrowUp":
            velocity = { dx: 0, dy: -1 };
            break;
          default:
            console.error("Error with handleKeyDown");
        }
        if (
          !(
            previousVelocity.dx + velocity.dx === 0 &&
            previousVelocity.dy + velocity.dy === 0
          )
        ) {
          setVelocity(velocity);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [previousVelocity]);

  return (
    <div
      ref={containerRef}
      className={cn(styles.container, className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={cn(styles.canvas)}
      />
      {isLose && <div className={cn(styles.lost_game)}>GAME OVER!</div>}
      {isWinner && <div className={cn(styles.lost_game)}>WELL DONE!</div>}
      {countDown !== 0 && (
        <button
          onClick={startGame}
          className={cn(styles.start_game)}
          aria-label={"Start Snake Game"}
        >
          {isWinner || isLose
            ? "play-again"
            : countDown === 4
              ? "start-game"
              : countDown}
        </button>
      )}
    </div>
  );
};
