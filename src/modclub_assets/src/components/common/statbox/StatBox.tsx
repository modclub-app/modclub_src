import PowerBar from "../../common/powerbar/PowerBar";
import InfoButton from "../../common/infobutton/InfoButton";
import { Columns, Heading, Card} from "react-bulma-components";

type StatBoxProps = {
    loading: boolean;
    image: any;
    title: string;
    amount: number;
    usd: number;
    detailed: boolean;
    children?: React.ReactNode;
    message: string;
    isBar: boolean;
    showLevel?: boolean;
    level?: string;
};
const userLevel = {
    novice: "Novice Moderator",
    junior: "Junior Moderator",
    senior1: "Senior Moderator",
    senior2: "Senior Moderator",
    senior3: "Senior Moderator",
}

export const StatBox: React.FC<StatBoxProps> = ({
    loading,
    image,
    title,
    amount,
    usd,
    detailed,
    children,
    message,
    isBar,
    showLevel = false,
    level = null
  }) => {
    return (
      <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
        <Card backgroundColor="circles" className="is-fullheight">
          <Card.Content className="is-flex is-align-items-center">
            <img src={image} className="mr-4" />
            <div style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
              <p className="has-text-light">{title}</p>
              {loading ? (
                <div className="loader is-loading" />
              ) : (
                <Heading size={1} style={{ lineHeight: 1 }}>
                {showLevel && <p style={{ border: 0, marginTop: detailed ? "1.3rem" : "0.3rem", marginBottom: detailed && "-2rem",fontSize:"15px" }}> {userLevel[level]} </p>}
                {detailed && (
                    <span className="has-text-weight-normal is-size-4 ml-4"></span>
                )}
                {!isBar && amount !== undefined && amount}
                {isBar && (
                    <PowerBar
                      points={amount / 100}
                      gradient={false}
                      align="center"
                      width={200}
                      showMax={true}
                    />
                )}
                </Heading>
              )}
            </div>
            <InfoButton
              message={message}
              style={{ position: "absolute", top: "1rem", right: "1rem" }}
            />
          </Card.Content>
          {detailed && (
            <Card.Footer
              paddingless
              style={{ border: 0, marginBottom: "1.5rem" }}
            >
              {children}
            </Card.Footer>
          )}
        </Card>
      </Columns.Column>
    );
  };