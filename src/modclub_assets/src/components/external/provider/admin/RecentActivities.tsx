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
import { Table } from "./ActivityTable";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

export default function AdminActivity() {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const { modclub } = useActors();
  const history = useHistory();
  const [contentHistory, setContentHistory] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<string>("new");
  const filters = ["approved", "new", "rejected"];
  const PAGE_SIZE = 50;
  const defaultPageParams = {
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE,
  };
  const [page, setPage] = useState({
    approved: { ...defaultPageParams },
    new: { ...defaultPageParams },
    rejected: { ...defaultPageParams },
  });
  const [hasReachedEnd, setHasReachedEnd] = useState({
    approved: false,
    new: false,
    rejected: false,
  });

  const getLabel = (label: string) => {
    if (label === "new") return "In Progress";
    if (label === "approved") return "Approved";
    if (label === "rejected") return "Rejected";
  };

  const getVotingHistory = (cid, votings) =>
    votings.find((v) => v.cid == cid) || {};

  const getProviderContent = async (doNotFetchExisting) => {
    setLoading(true);
    let status = { [currentFilter]: null };
    const startIndex = page[currentFilter]?.startIndex || 0;
    const endIndex = page[currentFilter]?.endIndex || PAGE_SIZE;

    let providerContents = await modclub.getProviderContent(
      appState.selectedProvider.id,
      status,
      BigInt(startIndex),
      BigInt(endIndex)
    );

    if (providerContents.content.length < PAGE_SIZE && !doNotFetchExisting) {
      status[currentFilter] = true;
      setHasReachedEnd({ ...hasReachedEnd, ...status });
    }

    const content = providerContents.content.map((c) => ({
      ...c,
      votingHistory: getVotingHistory(c.id, providerContents.voting),
    }));

    setContentHistory([...content]);
    setLoading(false);
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
    appState.selectedProvider && !loading && getProviderContent(false);
  };

  useEffect(() => {
    if (appState.selectedProvider && currentFilter) {
      getProviderContent(false);
    }
  }, [appState.selectedProvider, currentFilter]);

  return (
    <>
      <Button
        color={"ghost"}
        className="has-text-white mr-0"
        onClick={() => history.push("/provider/admin")}
      >
        <b>{"< Back To Dashboard"}</b>
      </Button>
      <Columns>
        <Columns.Column size={12}>
          <Card>
            <Card.Content className="level">
              <Heading marginless>Recent Activity</Heading>
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

          <Card>
            <Card.Content>
              <Table
                loading={loading}
                filteredActivity={contentHistory}
                filterLabel={getLabel(currentFilter)}
              />
            </Card.Content>
          </Card>
        </Columns.Column>
        {contentHistory.length > 0 && (
          <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>Showing 1 to {contentHistory.length} items</div>
                <Button
                  color="primary"
                  onClick={() => nextPage()}
                  disabled={hasReachedEnd[currentFilter]}
                  className={loading && "is-loading"}
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
