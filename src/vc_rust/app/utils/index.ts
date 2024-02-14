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

export const readCanisterId = (): string => {
  const setupJs = document.querySelector(
    "[data-canister-id]"
  ) as HTMLElement | null;
  if (!setupJs || setupJs.dataset.canisterId === undefined) {
    throw new Error("canisterId is undefined"); // abort further execution of this script
  }

  return setupJs.dataset.canisterId;
};
