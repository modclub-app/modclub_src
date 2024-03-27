const Spinner = ({ width = 25, height = 25 }) => {
  return (
    <div
      className="loader is-loading"
      style={{ width: width, height: height }}
    ></div>
  );
};

export default Spinner;
