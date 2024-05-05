import { useEffect, useState } from "react";
import { SplitLayout, SplitCol, Text, FixedLayout, Div, Button, ButtonGroup } from "@vkontakte/vkui";

import "./app.css";

import { Point } from "./types/point";
import { Block } from "./types/block";

const FIELD_SIZE_X = 10;
const FIELD_SIZE_Y = 20;
const BLOCK_SIZE = 25;

export const App = () => {
  const [currentBlock, setCurrentBlock] = useState<Block>({ points: [{ x: -1, y: -1 }] });

  const newBlock = () => {
    setCurrentBlock({
      points: [
        { x: 6, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 3 },
        { x: 6, y: 1 },
      ],
    });
  };

  useEffect(() => {
    console.log(currentBlock);
  }, [currentBlock]);

  const moveLeft = () => {
    const new_points: Point[] = currentBlock.points.map((p) => {
      return { x: p.x - 1, y: p.y };
    });
    setCurrentBlock({ points: new_points });
  };

  const moveRight = () => {
    const new_points: Point[] = currentBlock.points.map((p) => {
      return { x: p.x + 1, y: p.y };
    });
    setCurrentBlock({ points: new_points });
  };

  // поворот блока
  const rotate = () => {
    console.log("rotating block");
    const avg_x = Math.round(currentBlock.points.map((p) => p.x).reduce((sum, p) => sum + p) / 4);
    const avg_y = Math.round(currentBlock.points.map((p) => p.y).reduce((sum, p) => sum + p) / 4);

    console.log(`avg x = ${avg_x} ; avg_y = ${avg_y}`);

    const new_points: Point[] = currentBlock.points.map((p) => {
      //debugger;

      if (p.x == avg_x && p.y == avg_y) {
        return { x: p.x, y: p.y };
      } else if (p.x == avg_x && p.y < avg_y) {
        return { x: p.x + 1, y: p.y + 1 };
      } else if (p.x == avg_x && p.y > avg_y) {
        return { x: p.x - 1, y: p.y - 1 };
      } else if (p.x < avg_x && p.y == avg_y) {
        return { x: p.x + 1, y: p.y - 1 };
      } else if (p.x < avg_x && p.y < avg_y) {
        return { x: p.x + 1, y: p.y };
      } else if (p.x < avg_x && p.y > avg_y) {
        return { x: p.x - 1, y: p.y - 1 };
      } else if (p.x > avg_x && p.y == avg_y) {
        return { x: p.x - 1, y: p.y + 1 };
      } else if (p.x > avg_x && p.y < avg_y) {
        return { x: p.x - 1, y: p.y + 1 };
      } else if (p.x > avg_x && p.y > avg_y) {
        return { x: p.x - 1, y: p.y };
      }
    });

    setCurrentBlock({ points: new_points });
  };

  const moveDown = () => {
    if (currentBlock.points.filter((p) => p.y >= FIELD_SIZE_Y - 1).length > 0) {
      // TODO: тут будет много проверок

      console.log(currentBlock);
      // блок дошёл до конца
      return;
    }
    const new_points: Point[] = currentBlock.points.map((p) => {
      return { x: p.x, y: p.y + 1 };
    });

    setCurrentBlock({ points: new_points });
  };

  const drawBlock = () => {
    return currentBlock.points.map((p) => (
      <div
        key={100 * (p.y * BLOCK_SIZE + p.x)}
        className="elementBlock"
        style={{ top: p.y * BLOCK_SIZE, left: p.x * BLOCK_SIZE }}></div>
    ));
  };

  useEffect(() => {
    newBlock();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key == "ArrowLeft") {
        moveLeft();
      } else if (event.key == "ArrowRight") {
        moveRight();
      } else if (event.key == " ") {
        rotate();
      } else {
        console.log(event.key);
      }
    };

    console.log("set timeout");
    // const timeoutDown = setTimeout(() => {
    //   moveDown();
    // }, 1000);

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      console.log("clear timeout");
      window.removeEventListener("keydown", handleKeyPress);
      //clearTimeout(timeoutDown);
    };
  }, [currentBlock]);

  const blocks = () => {
    const divs = new Array(FIELD_SIZE_X * FIELD_SIZE_Y);

    for (let i = 0; i < FIELD_SIZE_Y; i++) {
      for (let j = 0; j < FIELD_SIZE_X; j++) {
        divs.push(
          <div
            className="fieldBlock"
            key={i * BLOCK_SIZE + j}
            style={{ top: i * BLOCK_SIZE, left: j * BLOCK_SIZE }}></div>
        );
      }
    }

    return divs;
  };

  return (
    <SplitLayout>
      <SplitCol style={{ backgroundColor: "goldenrod" }} fixed width="370px" maxWidth="370px">
        <Text>Тут будет само поле для тестриса</Text>

        <Div className="mainField">
          {blocks()}
          {drawBlock()}
        </Div>
      </SplitCol>
      <SplitCol style={{ backgroundColor: "hotpink" }}>
        <Text>Настройки тетриса всякие</Text>
      </SplitCol>

      <FixedLayout vertical="bottom" filled style={{ backgroundColor: "blueviolet", height: "100px" }}>
        <Text>Элементы управления</Text>
        <ButtonGroup>
          <Button onClick={moveLeft}>Влево</Button>
          <Button onClick={moveRight}>Вправо</Button>
        </ButtonGroup>
      </FixedLayout>
    </SplitLayout>
  );
};
