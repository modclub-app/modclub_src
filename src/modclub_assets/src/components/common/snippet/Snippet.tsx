type Props = {
  string?: string;
  truncate?: number;
};

export default function Snippet(props: Props) {
  return props.string.length > props.truncate ? (
    <div className="dropdown is-hoverable">
      <div className="dropdown-trigger">
        {props.string.substring(0, props.truncate - 5) + '...'}
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          <div className="dropdown-item has-text-white">
            {props.string}
          </div>
        </div>
      </div>
    </div>) : <>{props.string}</>
}