import { useEffect, useState } from "react";
import { SplitLayout, SplitCol, Text, FixedLayout, Div } from "@vkontakte/vkui";

import "./app.css";

import { Point } from "./types/point";
import { Block } from "./types/block";

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

  const handleKeyPress = (event: KeyboardEvent) => {
    console.log(event.key);
    if (event.key == "ArrowLeft") {
      moveLeft();
    } else if (event.key == "ArrowRight") {
      moveRight();
    }
  };

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

  const moveDown = () => {
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

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  setTimeout(() => {
    moveDown();
  }, 1000);

  const blocks = () => {
    const divs = new Array(20 * 10);

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
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
      </FixedLayout>
    </SplitLayout>
  );
};
