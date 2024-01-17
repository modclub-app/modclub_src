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
import { Form, Field } from "react-final-form";
import Userstats from "./Userstats";
import { modclub_types } from "../../../utils/types";
import { useProfile } from "../../../contexts/profile";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { Table } from "./ActivityTable";

export default function Activity() {
  const { principal } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { modclub } = useActors();
  const [completedActivity, setCompletedActivity] = useState<
    modclub_types.Activity[]
  >([]);
  const [inProgressActivity, setInProgressActivity] = useState<
    modclub_types.Activity[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateProfileLoader, setUpdateProfileLoader] =
    useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [editEmail, setEditEmail] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<string>("new");

  // Add state for the sort order (default to 'desc' for descending)
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = ["completed", "new"];

  const getLabel = (label: string) => {
    if (label === "new") return "In Progress";
    if (label === "completed") return "Completed";
  };

  // Check if the 'vote' array is not empty and use its first element,
  // otherwise, use the first element of the 'pohVote' array.
  // If both are empty, return a default value.
  const getLatestVoteTimestamp = (voteArray, pohVoteArray) => {
    if (voteArray.length > 0) {
      return voteArray[0].createdAt;
    } else if (pohVoteArray.length > 0) {
      return pohVoteArray[0].createdAt;
    } else {
      return BigInt(0);
    }
  };

  //sort activities based on timestamp
  const sortActivities = (activities, sortOrder) => {
    const timestamps = activities.map((activity) => ({
      activity,
      timestamp:
        Number(getLatestVoteTimestamp(activity.vote, activity.pohVote)) / 1000,
    }));
    return timestamps
      .sort((a, b) => {
        return sortOrder === "desc"
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
      })
      .map((item) => item.activity);
  };

  // Updates the activity list state
  const updateActivitiesState = (activities, sortOrder) => {
    const sortedActivities = sortActivities(activities, sortOrder);

    if (currentFilter === "new") {
      setInProgressActivity(sortedActivities);
    } else {
      setCompletedActivity(sortedActivities);
    }
  };

  // Toggles the sorting order of activities and updates the state to reflect the change.
  const handlerSortActivities = () => {
    const currentSortFilter =
      currentFilter === "new" ? inProgressActivity : completedActivity;
    const currSortOrder = sortOrder === "desc" ? "asc" : "desc";
    updateActivitiesState(currentSortFilter, currSortOrder);
    setSortOrder(currSortOrder); //
  };

  //function to handle descending and ascending sort order on click of in progress and completed
  const handleFilterChange = (newFilter) => {
    // Set the sort order to 'desc' by default
    setSortOrder("desc");
    // Update the current filter
    setCurrentFilter(newFilter);
    // Call updateActivitiesState to apply the new sort order
    const currentSortFilter =
      newFilter === "new" ? inProgressActivity : completedActivity;
    updateActivitiesState(currentSortFilter, "desc");
  };
  //fetch activities
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

  const updateProfileEmail = ({ email: _email }) => {
    if (appState.userProfile && appState.userProfile?.email !== _email) {
      setNewEmail(_email);
      setUpdateProfileLoader(true);
      dispatch({
        type: "updateUserEmail",
        payload: _email,
      });
    } else {
      setEditEmail(false);
    }
  };

  useEffect(() => {
    if (appState.userProfile?.email == newEmail) {
      setUpdateProfileLoader(false);
      setEditEmail(false);
    }
  }, [appState.userProfile?.email]);

  useEffect(() => {
    appState.userProfile && fetchActivity(currentFilter);
  }, [appState.userProfile, modclub]);

  // This useEffect will now also re-sort the activities whenever sortOrder changes
  useEffect(() => {
    const sortAndSetActivities = async () => {
      setLoading(true);

      let activities;
      if (modclub) {
        activities =
          currentFilter === "new"
            ? await modclub.getActivity(false)
            : await modclub.getActivity(true);
      } else {
        // Handle the case where modclub is not available
        activities = []; // or some default value
      }

      // Sort the activities
      updateActivitiesState(activities, sortOrder);
      setLoading(false);
    };

    sortAndSetActivities();
  }, [currentFilter, modclub]);

  const displayEmail = () => (
    <p className="is-flex is-justify-content-center has-text-white">
      {appState.userProfile?.email || ""}
      <Icon
        color="white"
        className="ml-3 is-clickable"
        onClick={() => {
          navigator.clipboard.writeText(appState.userProfile?.email || "");
        }}
      >
        <span className="material-icons">file_copy</span>
      </Icon>
      <Icon
        color="white"
        className="ml-3 is-clickable"
        onClick={() => {
          setEditEmail(true);
        }}
      >
        <span className="material-icons">edit</span>
      </Icon>
    </p>
  );

  const displayEmailEdit = () => (
    <div className="field">
      <div className="control">
        <Form
          onSubmit={updateProfileEmail}
          render={({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <Field
                name="email"
                component="input"
                type="text"
                className={"input"}
                style={{ width: "500px" }}
                initialValue={appState.userProfile?.email || ""}
              />
              <Button
                color="primary"
                style={{
                  marginLeft: "10px",
                  marginTop: "5px",
                }}
                className={updateProfileLoader ? "is-loading" : ""}
                disabled={updateProfileLoader}
              >
                Save
              </Button>
            </form>
          )}
        />
      </div>
    </div>
  );

  return (
    <>
      <Userstats detailed={true} />
      <Columns>
        <Columns.Column size={12}>
          <Card className="has-gradient">
            <Card.Content textAlign="center">
              <label className="label">My Email:</label>
              {editEmail ? displayEmailEdit() : displayEmail()}
            </Card.Content>
          </Card>
        </Columns.Column>
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
                    className={currentFilter === filter ? "is-active" : ""}
                    onMouseDown={() => handleFilterChange(filter)}
                  >
                    {getLabel(filter)}
                  </Dropdown.Item>
                ))}
              </Dropdown>

              <Button.Group className="is-hidden-mobile">
                <Button
                  color={currentFilter === "new" ? "primary" : "ghost"}
                  className="has-text-white mr-0"
                  onClick={() => handleFilterChange("new")}
                >
                  In Progress
                </Button>
                <Button
                  color={currentFilter === "completed" ? "primary" : "ghost"}
                  className="has-text-white mr-0"
                  onClick={() => handleFilterChange("completed")} // Update to use handleFilterChange
                >
                  Completed
                </Button>
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
                sortOrder={sortOrder}
                onSortOrderChange={() => handlerSortActivities()}
              />
            </Card.Content>
          </Card>
        </Columns.Column>
      </Columns>
    </>
  );
}
