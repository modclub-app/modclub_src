import * as React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Modal,
  Heading,
  Columns,
  Card,
  Button,
  Icon,
  Notification,
} from "react-bulma-components";
import Userstats from "../profile/Userstats";
import FilterBar from "../../common/filterbar/FilterBar";
import { formatDate, getUrlForData } from "../../../utils/util";
import { modclub_types } from "../../../utils/types";
import placeholder from "../../../../assets/user_placeholder.png";
import { useProfile } from "../../../contexts/profile";
import { useActors } from "../../../utils";
import { useConnect } from "@connect2icmodclub/react";
import { Principal } from "@dfinity/principal";
import { fetchObjectUrl } from "../../../utils/jwt";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import ApplicantSnippet from "./ApplicationSnippet";

const PAGE_SIZE = 9;

export default function PohApplicantList() {
  const { principal } = useConnect();
  const appState = useAppState();
  const { rs, modclub } = useActors();
  const [loading, setLoading] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<
    Array<modclub_types.PohTaskPlus>
  >([]);
  const [page, setPage] = useState({
    page: 1,
    startIndex: 0,
    endIndex: PAGE_SIZE - 1,
  });
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [level, setLevel] = useState("novice");

  const apps = ["Reddit", "4chan", "Medium"];
  const [currentApp, setCurrentApp] = useState<string>(null);
  const handleAppChange = (app) => {
    setCurrentApp(app);
  };

  const filters = ["All", "Newest", "Most Voted", "Less Voted"];
  const [currentFilter, setCurrentFilter] = useState<string>("All");
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const getApplicants = async () => {
    setLoading(true);
    const status = { new: null };
    const newApplicants = await modclub.getPohTasks(
      status,
      page.startIndex as unknown as bigint,
      page.endIndex as unknown as bigint
    );
    console.log("newApplicants", newApplicants);
    if (newApplicants.length < PAGE_SIZE) setHasReachedEnd(true);
    setApplicants([...applicants, ...newApplicants]);
    setLoading(false);
  };
  const getUserLv = async () => {
    if (principal && rs) {
      try {
        const res = await rs.queryRSAndLevelByPrincipal(
          Principal.fromText(principal)
        );
        if (typeof res.level === "object") {
          setLevel(Object.keys(res.level)[0]);
        }
      } catch (error) {
        console.error("Error GET LEVEL:", error);
        setLevel("novice");
      }
    }
  };

  useEffect(() => {
    if (modclub && !!appState.userProfile) {
      const applicantsResult = getApplicants();
      const userLevelResult = getUserLv();
      if (
        appState.userProfile &&
        firstLoad &&
        !loading &&
        !applicants.length &&
        applicantsResult &&
        userLevelResult
      ) {
        setFirstLoad(false);
      }
    }
  }, [appState.userProfile, modclub]);

  useEffect(() => {
    appState.userProfile && !loading && getApplicants();
  }, [page]);

  const nextPage = () => {
    let nextPageNum = page.page + 1;
    let start = (nextPageNum - 1) * PAGE_SIZE;
    setPage({
      page: nextPageNum,
      startIndex: start,
      endIndex: start + PAGE_SIZE - 1,
    });
  };

  if (loading) {
    return (
      <Modal show={true} showClose={false}>
        <div className="loader is-loading p-5"></div>
      </Modal>
    );
  }
  if (appState.userProfile && applicants.length === 0) {
    return (
      <section className="hero has-background-grey is-medium">
        <div className="hero-body container has-text-centered">
          <p className="has-text-silver is-size-4 has-text-centered mb-6">
            There are no proof of humanity applicants at the moment.
          </p>
        </div>
      </section>
    );
  }
  return (
    <>
      <Userstats />

      {level !== "novice" && (
        <Columns>
          <Columns.Column size={12}>
            <FilterBar
              apps={apps}
              currentApp={currentApp}
              onAppChange={handleAppChange}
              filters={filters}
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          </Columns.Column>

          {applicants.length &&
            applicants.map((applicant, index) => (
              <Columns.Column
                key={applicant.packageId}
                mobile={{ size: 11 }}
                tablet={{ size: 6 }}
                fullhd={{ size: 4 }}
              >
                <ApplicantSnippet applicant={applicant} />
              </Columns.Column>
            ))}
          <Columns.Column size={12}>
            <Card>
              <Card.Footer alignItems="center">
                <div>Showing 1 to {applicants.length} feeds</div>
                <Button
                  color="primary"
                  onClick={() => nextPage()}
                  className="ml-4 px-7 py-3"
                  disabled={hasReachedEnd}
                >
                  See more
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>
        </Columns>
      )}
    </>
  );
}
