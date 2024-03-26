import * as React from "react";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
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
import { useActors } from "../../../hooks/actors";
import {
  getCurrentDomain,
} from "../../../utils/util";
import ToggleSwitch from "../../common/toggleSwitch/toggle-switch";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { Table } from "./ActivityTable";

export default function Activity() {
  const { activeProvider, principal } = useConnect();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { modclub, modclub_assets } = useActors();
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

  const [vcStatus, setVcStatus] = useState<FilterType>(false);

  type FilterType = "new" | "completed";
  const [currentFilter, setCurrentFilter] = useState<FilterType>("new");

  // Add state for the sort order (default to 'desc' for descending)
  const [sortOrder, setSortOrder] = useState("desc");

  const filters: FilterType[] = ["completed", "new"];

  const getLabel = (label: string) => {
    if (label === "new") return "In Progress";
    if (label === "completed") return "Completed";
  };

  // Function to find the latest timestamp from all(two) arrays of vote objects, handling different time units for comparison
  const getLatestVoteTimestamp = (voteArray, pohVoteArray) => {
    let latestVoteTimestamp = BigInt(0);

    if (voteArray.length > 0) {
      latestVoteTimestamp = voteArray[0].createdAt;
    }

    if (pohVoteArray.length > 0) {
      // Convert nanoseconds to milliseconds for compatible comparison
      const pohLatestVoteTimestamp =
        pohVoteArray[0].createdAt / BigInt(1000000);

      if (pohLatestVoteTimestamp > latestVoteTimestamp) {
        latestVoteTimestamp = pohLatestVoteTimestamp;
      }
    }
    return latestVoteTimestamp;
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
    switch (currentFilter) {
      case "new":
        setInProgressActivity(sortedActivities);
        break;
      case "completed":
        setCompletedActivity(sortedActivities);
        break;
    }
  };

  // Toggles the sorting order of activities and updates the state to reflect the change.
  const handlerSortActivities = () => {
    const currentSortFilter =
      currentFilter === "new" ? inProgressActivity : completedActivity;
    const currSortOrder = sortOrder === "desc" ? "asc" : "desc";
    updateActivitiesState(currentSortFilter, currSortOrder);
    setSortOrder(currSortOrder);
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
  const fetchActivity = async (filter: FilterType) => {
    setLoading(true);
    if (modclub) {
      switch (filter) {
        case "new":
          setInProgressActivity(await modclub.getActivity(false));
          break;
        case "completed":
          setCompletedActivity(await modclub.getActivity(true));
          break;
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

  useEffect(() => {
    modclub &&
      modclub
        .isEnabledVCForUser()
        .then((vcRes) => {
          console.log("isEnabledVCForUser::", vcRes);
          vcRes && setVcStatus(vcRes);
        })
        .catch((e) => {
          console.error("An ERROR occurs on isEnabledVCForUser::", e);
        });
  }, [modclub]);

  // useEffect hook to fetch and sort activities based on user profile and filter, updating relevant states
  // used switch to avoid magic string
  useEffect(() => {
    const fetchActivity = async (filter: FilterType) => {
      setLoading(true);
      if (modclub) {
        let activities;
        switch (filter) {
          case "new":
            activities = await modclub.getActivity(false);
            break;
          case "completed":
            activities = await modclub.getActivity(true);
            break;
        }

        const sortedActivities = sortActivities(activities, sortOrder);
        switch (filter) {
          case "new":
            setInProgressActivity(sortedActivities);
            break;
          case "completed":
            setCompletedActivity(sortedActivities);
            break;
        }
      }
      setLoading(false);
    };

    if (appState.userProfile) {
      fetchActivity(currentFilter);
    }
  }, [appState.userProfile, currentFilter, modclub]);

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

  const vcChange = (val) => {
    modclub &&
      modclub
        .toggleVCForUser(val)
        .then((res) => {
          !res.err && setVcStatus(res.ok);
        })
        .catch((e) => {
          console.error("An ERROR occurs in toggleVCForUser::", e.message);
        });
  };

  return (
    <>
      <Userstats detailed={true} />
      {/* Verified Credentials */}
      <Columns>
        {activeProvider.meta.id === "ii" && (
          <Columns.Column size={12}>
            <Card className="has-gradient">
              <Card.Content textAlign="center">
                <label className="label">Verified Credentials</label>
                <p className="pb-2">
                  {`Your Verified Credentials is currently ${
                    vcStatus ? "Enable" : "Disable"
                  }`}
                </p>
                <ToggleSwitch
                  id="verifiedCredentialsSwitcher"
                  checked={!!vcStatus}
                  onChange={vcChange}
                />
              </Card.Content>
            </Card>
          </Columns.Column>
        )}

        {/* Email */}
        <Columns.Column size={12}>
          <Card className="has-gradient">
            <Card.Content textAlign="center">
              <label className="label">My Email:</label>
              {editEmail ? displayEmailEdit() : displayEmail()}
            </Card.Content>
          </Card>
        </Columns.Column>

        {/* Principal ID */}
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
