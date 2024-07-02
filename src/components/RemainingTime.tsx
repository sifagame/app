interface RemainingTimeProps {
  nextClaimAt: bigint;
}

export const RemainingTime = (props: RemainingTimeProps) => {
  const nextClaimString = props.nextClaimAt
    ? `${new Date(Number(props.nextClaimAt) * 1000).toLocaleString()} for`
    : "";

  return nextClaimString ? (
    <p>Please wait until {nextClaimString} the next claim.</p>
  ) : (
    <></>
  );
};
