// Run an async op while disabling interaction
export const withDisabled = async <A, _>(
  fn: () => Promise<A>,
  dsblResolver: () => {}
): Promise<A> => {
  dsblResolver(true);
  try {
    return await fn();
  } finally {
    dsblResolver(false);
  }
};
