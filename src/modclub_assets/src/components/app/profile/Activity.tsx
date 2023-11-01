import * as React from "react";
import { useEffect, useState } from "react";
import { useConnect } from "@connect2icmodclub/react";
import {
  Columns,
  Card,
  Heading,
  Button,
  Dropdown,
  Icon,
} from "react-bulma-components";
import Userstats from "./Userstats";
import { modclub_types } from "../../../utils/types";
import { useProfile } from "../../../contexts/profile";
import { useActors } from "../../../hooks/actors";
import { useAppState } from "../state_mgmt/context/state";
import { Table } from "./ActivityTable";

export default function Activity() {
  const { principal } = useConnect();
  const appState = useAppState();
  const { modclub } = useActors();
  const [completedActivity, setCompletedActivity] = useState<
    modclub_types.Activity[]
  >([]);
  const [inProgressActivity, setInProgressActivity] = useState<
    modclub_types.Activity[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");

  const filters = ["completed", "new"];

  const getLabel = (label: string) => {
    if (label === "new") return "In Progress";
    if (label === "completed") return "Completed";
  };

  const fetchActivity = async (filter) => {
    setLoading(true);
    if (modclub) {
      if (filter === "new") {
        setInProgressActivity(await modclub.getActivity(false));
      } else {
        setCompletedActivity(await modclub.getActivity(true));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    appState.userProfile && fetchActivity(currentFilter);
  }, [appState.userProfile, modclub]);

  useEffect(() => {
    fetchActivity(currentFilter);
  }, [currentFilter, modclub]);

  return (
    <>
      <Userstats detailed={true} />
      <Columns>
        <Columns.Column size={12}>
          <Card className="has-gradient">
            <Card.Content textAlign="center">
              <label className="label">My Principal ID</label>
              <p className="is-flex is-justify-content-center has-text-white">
                {principal}
                <Icon
                  color="white"
                  className="ml-3 is-clickable"
                  onClick={() => {
                    navigator.clipboard.writeText(principal);
                  }}
                >
                  <span className="material-icons">file_copy</span>
                </Icon>
              </p>
            </Card.Content>
          </Card>
        </Columns.Column>

        <Columns.Column size={12}>
          <Card>
            <Card.Content className="level">
              <Heading marginless>Recent Activity</Heading>

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
                {filters.map((filter) => (
                  <Dropdown.Item
                    key={filter}
                    value={filter}
                    renderAs="a"
                    className={currentFilter === filter && "is-active"}
                    onMouseDown={() => setCurrentFilter(filter)}
                  >
                    {getLabel(filter)}
                  </Dropdown.Item>
                ))}
              </Dropdown>

              <Button.Group className="is-hidden-mobile">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    color={currentFilter === filter ? "primary" : "ghost"}
                    className="has-text-white mr-0"
                    onClick={() => setCurrentFilter(filter)}
                  >
                    {getLabel(filter)}
                  </Button>
                ))}
              </Button.Group>
            </Card.Content>
          </Card>
        </Columns.Column>

        <Columns.Column size={12}>
          <Card>
            <Card.Content>
              <Table
                loading={loading}
                filteredActivity={
                  currentFilter == "new"
                    ? inProgressActivity
                    : completedActivity
                }
                getLabel={getLabel}
                currentFilter={currentFilter}
              />
            </Card.Content>
          </Card>
        </Columns.Column>
      </Columns>
    </>
  );
}
