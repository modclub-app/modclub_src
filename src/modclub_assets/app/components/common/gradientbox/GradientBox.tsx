import PropTypes from "prop-types";
import { Columns, Card, Heading } from "react-bulma-components";
export const GradientBox = ({ children, title, showToken = true }) => {
  return (
    <Columns.Column
      tablet={{ size: 4 }}
      desktop={{ size: 6 }}
      style={{ padding: ".75rem" }}
    >
      <Card className="has-gradient is-fullheight">
        <Card.Content className="is-fullheight" style={{ padding: "20% 10%" }}>
          <Heading subtitle size={6} className="has-text-silver">
            {title}
          </Heading>
          <Heading
            size={1}
            className="is-flex is-align-items-center"
            style={{ lineHeight: 1, whiteSpace: "nowrap" }}
          >
            {children}
            {showToken && (
              <span className="is-size-5 ml-1">
                MOD
                <span className="is-block has-text-weight-light">token</span>
              </span>
            )}
          </Heading>
        </Card.Content>
      </Card>
    </Columns.Column>
  );
};
GradientBox.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  showToken: PropTypes.bool,
};
GradientBox.defaultProps = {
  showToken: true,
};
