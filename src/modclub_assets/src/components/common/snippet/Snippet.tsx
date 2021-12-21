type Props = {
  string?: string;
  truncate?: number;
};

export default function Snippet(props: Props) {
  return props.string.length > props.truncate ? (
    <div className="dropdown is-hoverable is-up">
      <div className="dropdown-trigger">
        {props.string.substring(0, props.truncate - 5) + '...'}
      </div>
      <div className="dropdown-menu" role="menu">
        <div className="dropdown-content p-0">
          <div className="dropdown-item has-text-white" style={{ padding: "0.375rem", fontSize: 11 }}>
            {props.string}
          </div>
        </div>
      </div>
    </div>) : (
      <>{props.string}</>
    )
}