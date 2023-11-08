import * as React from "react";
import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDate } from "../../../utils/util";
import {
  Columns,
  Card,
  Heading,
  Button,
  Dropdown,
  Icon,
} from "react-bulma-components";
import { useActors } from "../../../../hooks/actors";
// import { Table } from "../profile/ActivityTable";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

export default function AdminActivity() {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { modclub } = useActors();
  const [approvedActivity, setApprovedActivity] = useState([]);
  const [inProgressActivity, setInProgressActivity] = useState([]);
  const [rejectedActivity, setRejectedActivity] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAdditional, setLoadingAdditional] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");
  const filters = ["approved", "new", "rejected"];
  const PAGE_SIZE = 20;
  const parentPageObj = {
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE,
    hasDataFetched: false,
  };
  const [page, setPage] = useState({
    approved: { ...parentPageObj },
    new: { ...parentPageObj },
    rejected: { ...parentPageObj },
  });
  const [hasReachedEnd, setHasReachedEnd] = useState({
    approved: false,
    new: false,
    rejected: false,
  });

  const history = useHistory();
  if (!appState.selectedProvider) {
    history.push("/app");
  }
  const getLabel = (label: string) => {
    if (label === "new") return "In Progress";
    if (label === "approved") return "Approved";
    if (label === "rejected") return "Rejected";
  };

  const getProviderContent = async (selectedFilter, doNotFetchExisting) => {
    let status = {};
    status[selectedFilter] = null;
    const startIndex = page[selectedFilter].startIndex;
    const endIndex = page[selectedFilter].endIndex;
    setLoadingAdditional(true);
    /*  Get provider contents if selectedFilter has not reached to the end or selected filter data has not previously fetched
        that's to make sure each filter fetches data atleast once when user switches to different tabs AND make sure each
        filter data was fetched atleast once and based on passed flag to prevent fetching same data on switching tabs.
    */
    let providerContents =
      (hasReachedEnd[selectedFilter] || page[selectedFilter].hasDataFetched) &&
      page[selectedFilter].hasDataFetched &&
      doNotFetchExisting
        ? []
        : await modclub.getProviderContent(
            appState.selectedProvider.id,
            status,
            BigInt(startIndex),
            BigInt(endIndex)
          );
    page[selectedFilter].hasDataFetched = true;
    setPage({ ...page, ...page });
    if (providerContents.length < PAGE_SIZE && !doNotFetchExisting) {
      status[selectedFilter] = true;
      setHasReachedEnd({ ...hasReachedEnd, ...status });
    }
    setLoading(true);

    switch (selectedFilter) {
      case "new":
        if (providerContents.length > 0)
          setInProgressActivity([...inProgressActivity, ...providerContents]);
        break;
      case "approved":
        if (providerContents.length > 0)
          setApprovedActivity([...approvedActivity, ...providerContents]);
        break;
      case "rejected":
        if (providerContents.length > 0)
          setRejectedActivity([...rejectedActivity, ...providerContents]);
        break;
      default:
        if (providerContents.length > 0)
          setInProgressActivity([...inProgressActivity, ...providerContents]);
        break;
    }
    setLoading(false);
    setLoadingAdditional(false);
  };

  const nextPage = () => {
    let nextPageNum = page[currentFilter].page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    page[currentFilter] = {
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE,
    };
    setPage({ ...page, ...page });
    appState.selectedProvider &&
      !loading &&
      getProviderContent(appState.selectedProvider, currentFilter, false);
  };

  useEffect(() => {
    if (appState.selectedProvider) {
      getProviderContent(appState.selectedProvider, "new", false);
    }
  }, [appState.selectedProvider]);

  return (
    <>
      <Columns>
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
                    onClick={() => {
                      setCurrentFilter(filter);
                      getProviderContent(selectedProvider, filter, true);
                    }}
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
                    onClick={() => {
                      setCurrentFilter(filter);
                      getProviderContent(
                        appState.selectedProvider,
                        filter,
                        true
                      );
                    }}
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
              <h2>ActivityTable</h2>
              {/* <Table
                loading={loading}
                filteredActivity={
                  currentFilter == "new"
                    ? inProgressActivity
                    : currentFilter == "approved"
                    ? approvedActivity
                    : rejectedActivity
                }
                getLabel={getLabel}
                currentFilter={currentFilter}
              /> */}
            </Card.Content>
          </Card>
        </Columns.Column>
        {(currentFilter == "new"
          ? inProgressActivity
          : currentFilter == "approved"
          ? approvedActivity
          : rejectedActivity
        ).length > 0 && (
          <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>
                  Showing 1 to{" "}
                  {
                    (currentFilter == "new"
                      ? inProgressActivity
                      : currentFilter == "approved"
                      ? approvedActivity
                      : rejectedActivity
                    ).length
                  }{" "}
                  activities
                </div>
                <Button
                  color="primary"
                  onClick={() => nextPage()}
                  disabled={hasReachedEnd[currentFilter]}
                  className={loadingAdditional && "is-loading"}
                >
                  See more
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>
        )}
      </Columns>
    </>
  );
}
