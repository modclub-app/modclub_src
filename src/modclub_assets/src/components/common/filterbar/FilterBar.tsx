import * as React from 'react'
import {
  Card,
  Dropdown,
  Button,
  Icon
} from "react-bulma-components";

export default function Confirm({
  apps,
  currentApp,
  onAppChange,

  filters,
  currentFilter,
  onFilterChange,
} : {
  apps?: Array<string>,
  currentApp?: string,
  onAppChange?: (filter: string) => void;

  filters?: Array<string>,
  currentFilter?: string,
  onFilterChange?: (filter: string) => void;
}) {
  return (
    <Card>
      <Card.Content className="level is-justify-content-flex-start">
        {apps && (
          <>
            <p className="has-text-light mr-5">
              Choose your favorite app:
            </p>

            <Dropdown
              className="mr-5"
              right
              label={currentApp ? currentApp : "All Apps"}
              icon={
                <Icon color="white">
                  <span className="material-icons">expand_more</span>
                </Icon>
              }
              style={{ width: 100 }}
            >
              {apps.map(app => 
                <Dropdown.Item
                  key={app}
                  value={app}
                  renderAs="a"
                  className={currentApp === app && "is-active"}
                  onMouseDown={() => onAppChange(app)}
                >
                  {app}
                </Dropdown.Item>
              )}
            </Dropdown>
          </>
        )}

        {filters && (
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