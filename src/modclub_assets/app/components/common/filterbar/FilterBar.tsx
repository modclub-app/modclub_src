import * as React from "react";
import { Card, Dropdown, Button, Icon } from "react-bulma-components";

// Icons
import arrowDownIconSvg from '../../../../assets/arrow_down_icon.svg';

export default function Confirm({
  apps,
  currentApp,
  onAppChange,

  filters,
  currentFilter,
  onFilterChange,
}: {
  apps?: Array<string>;
  currentApp?: string;
  onAppChange?: (filter: string) => void;

  filters?: Array<string>;
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}) {
  return (
    <Card>
      <Card.Content className="level is-justify-content-flex-start">
        {apps && (
          <>
            <p className="has-text-light mr-5">Choose your favorite app:</p>

            <Dropdown
              className="mr-5 dropdown-has-text-dark-green"
              right
              label={currentApp ? currentApp : "All Apps"}
              icon={
                <Icon>
                  <img className="mx-2" src={arrowDownIconSvg} alt="arrow_down" />
                </Icon>
              }
              style={{ width: 100 }}
            >
              {apps.map((app) => (
                <Dropdown.Item
                  key={app}
                  value={app}
                  renderAs="a"
                  className={currentApp === app && "is-active"}
                  onMouseDown={() => onAppChange(app)}
                >
                  {app}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </>
        )}

        {filters && (
          <>
            <Dropdown
              className="is-hidden-tablet dropdown-has-text-dark-green"
              right
              label="Filter"
              icon={
                <Icon>
                  <img src={arrowDownIconSvg} className="mx-2" alt="arrow_down" />
                </Icon>
              }
              style={{ width: 100 }}
            >
              {filters.map((filter) => (
                <Dropdown.Item
                  key={filter}
                  value={filter}
                  renderAs="a"
                  className={currentFilter === filter && "is-active"}
                  onMouseDown={() => onFilterChange(filter)}
                >
                  {filter}
                </Dropdown.Item>
              ))}
            </Dropdown>

            <Button.Group className="is-hidden-mobile">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  color={currentFilter === filter ? "primary" : "light"}
                  className="mr-0"
                  onClick={() => onFilterChange(filter)}
                >
                  {filter}
                </Button>
              ))}
            </Button.Group>
          </>
        )}
      </Card.Content>
    </Card>
  );
}
