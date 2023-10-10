import { useEffect, useState } from "react";

export function InstantSearch({ sdk }) {
  const authToken = sdk.parameters.installation.authToken;

  const [instantsearchUrl, setInstantsearchUrl] = useState();
  useEffect(() => {
    const fetchInstasearchUrl = async () => {
      const response = await fetch(
        `https://api.widencollective.com/v2/integrations/url`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.json();
    };

    fetchInstasearchUrl().then((response) => setInstantsearchUrl(response.url));
  }, [authToken]);

  useEffect(() => {
    const action = (event) => {
      if (event.data?.action == "embed") {
        sdk.close([event.data.items[0]]);
      }
    };

    window.addEventListener("message", action);

    return () => window.removeEventListener("message", action);
  }, []);

  if (instantsearchUrl === undefined) {
    return <div>Loading... </div>;
  }

  return <iframe width={1200} height={800} src={instantsearchUrl} />;
}
