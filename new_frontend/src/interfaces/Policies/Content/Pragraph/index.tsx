import React from "react";
import { Typography } from "@/components/uikit";
import { Paragraph as ParagraphTypes } from "../../types";

export const Paragraph: React.FC<ParagraphTypes> = ({
  title,
  label,
  text,
  list,
}) => (
  <>
    {title && (
      <div className="mt-4 mb-4">
        <Typography size="lg" weight="medium" tag="h2">
          {title}
        </Typography>
      </div>
    )}

    {label && (
      <div className="pb-2 pt-4">
        <Typography size="2sm" weight="medium" tag="h4">
          {label}
        </Typography>
      </div>
    )}

    <Typography size="sm" tag="p">
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </Typography>

    {list && (
      <ul className="pl-4 pt-4 list-decimal">
        {list.map((listItem) => (
          <li key={listItem} className="mt-0 pl-2.5 pb-1.25 last:pb-0">
            <Typography size="sm" tag="span">
              {listItem}
            </Typography>
          </li>
        ))}
      </ul>
    )}
  </>
);
