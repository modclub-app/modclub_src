import * as React from 'react'
import {
  Card,
  Dropdown,
  Button,
  Icon
} from "react-bulma-components";

export default function Confirm({
    isAdminUser,
    filters,
    currentFilter,
    onFilterChange,
} : {
    isAdminUser?: Boolean,
    filters?: Array<string>,
    currentFilter?: string,
    onFilterChange?: (filter: string) => void;
}) {
  return (
    <Card>
      <Card.Content className="level is-justify-content-flex-start">
        {isAdminUser && filters && (
          <>
            <Dropdown
              className="is-hidden-tablet"
              right
              label="Filter"
              icon={
                <Icon color="white">
                  <span className="material-icons">expand_more</span>
                </Icon>
              }
              style={{ width: 100 }}
            >
              {filters.map(filter => 
                <Dropdown.Item
                  key={filter}
                  value={filter}
                  renderAs="a"
                  className={currentFilter === filter && "is-active"}
                  onMouseDown={() => onFilterChange(filter)}
                >
                  {filter}
                </Dropdown.Item>
              )}
            </Dropdown>

            <Button.Group className="is-hidden-mobile">
              {filters.map(filter => 
                <Button
                  key={filter}
                  color={currentFilter === filter ? "primary" : "ghost"}
                  className="has-text-white mr-0"
                  onClick={() => onFilterChange(filter)}
                >
                  {filter}
                </Button>
              )}
            </Button.Group>
          </>
        )}

      </Card.Content>
    </Card>
  )
};