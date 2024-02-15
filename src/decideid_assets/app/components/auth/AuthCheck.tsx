const withAuthCheck = (WrappedComponent) => {
  return (props) => {
    const { isConnected, isInitializing } = useConnect();
    const { decideid } = useActors();

    if (isInitializing || !decideid) {
      return <p>Spinning... Init...</p>;
    }

    if (!isConnected) {
      return <NotAuthenticatedModal />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthCheck;
