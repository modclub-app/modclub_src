import React from "react";
import { Button, Card, Columns, Heading } from "react-bulma-components";

type PhrasesProps = {
  phrases: string[];
};

export const Phrases: React.FC<PhrasesProps> = ({ phrases }) => (
  <Card className="mt-6 mb-5">
    <Card.Content className="columns is-multiline">
      <Heading
        subtitle
        className="mb-3"
        textAlign="center"
        style={{ width: "100%" }}
      >
        Record yourself saying the following
        <br /> numbers in order:
      </Heading>

      {phrases.map((phrase) => (
        <Columns.Column key={phrase} size={4}>
          <div className="poh-phrase-item">
            {phrase}
          </div>
        </Columns.Column>
      ))}
    </Card.Content>
  </Card>
);
