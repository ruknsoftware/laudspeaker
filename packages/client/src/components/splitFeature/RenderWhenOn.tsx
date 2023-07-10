import {
  SplitFactory,
  SplitTreatments,
  useClient,
} from "@splitsoftware/splitio-react";

export default function RenderWhenOn({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}): JSX.Element {
  const client = useClient(
    JSON.parse(localStorage.getItem("userData") || "{}")?.email || "user"
  );

  const show = client?.getTreatment(featureName) === "on";

  if (show) return <>{children}</>;

  return <></>;
}
