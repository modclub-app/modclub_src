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
        <br /> words in order:
      </Heading>

      {phrases.map((phrase, index) => (
        <Columns.Column key={phrase} size={4}>
          <Button fullwidth isStatic>
            {index + 1}
            <span className="ml-2" style={{ width: 40 }}>
              {phrase}
            </span>
          </Button>
        </Columns.Column>
      ))}
    </Card.Content>
  </Card>
);
