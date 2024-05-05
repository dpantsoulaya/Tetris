import { FC } from "react";
import { Panel, PanelHeader, NavIdProps, Text, SplitLayout } from "@vkontakte/vkui";

export interface HomeProps extends NavIdProps {}

export const Home: FC<HomeProps> = ({ id }) => {
  return (
    <Panel id={id}>
      <PanelHeader>Тетрис</PanelHeader>
    </Panel>
  );
};
