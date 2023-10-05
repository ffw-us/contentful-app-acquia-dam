import { setup } from "@contentful/dam-app-base";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import logo from "./logo.png";
import "./index.css";

const CTA = "Select DAM media";

setup({
  cta: CTA,
  name: "Acquia DAM App",
  logo,
  color: "#036FE3",
  description:
    "Acquia DAM app provides integration between Contentful and Acquia DAM.",
  parameterDefinitions: [
    {
      id: "domain",
      type: "Symbol",
      name: "Acquia DAM Domain",
      description: "Provide the domain name here",
      required: true,
    },
    {
      id: "authToken",
      type: "Symbol",
      name: "Auth Token",
      description: "Provide the Auth Token here",
      required: true,
    },
  ],
  validateParameters,
  makeThumbnail,
  renderDialog,
  openDialog,
  isDisabled: () => false,
});

function DialogLocation({ sdk }) {
  const domain = sdk.parameters.installation.domain;
  const authToken = sdk.parameters.installation.authToken;

  const [instasearchUrl, setInstasearchUrl] = useState();
  useEffect(() => {
    const fetchInstasearchUrl = async () => {
      const response = await fetch(
        `https://api.widencollective.com/v2/integrations/url`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.json();
    };

    fetchInstasearchUrl().then((response) => setInstasearchUrl(response.url));
  }, [authToken]);

  useEffect(() => {
    const action = (event) => {
      if (event.data?.action == "embed") {
        console.log(event.data.items[0]);
        sdk.close([event.data.items[0]]);
      }
    };

    window.addEventListener("message", action);

    return () => window.removeEventListener("message", action);
  }, []);

  if (instasearchUrl === undefined) {
    return <div>Please wait</div>;
  }

  return <iframe width={1200} height={800} src={instasearchUrl} />;
}

function makeThumbnail(attachment) {
  const thumbnail = attachment.thumbnail_link;
  const url = typeof thumbnail === "string" ? thumbnail : undefined;
  const alt = attachment.embed_name;
  return [url, alt];
}

async function renderDialog(sdk) {
  render(<DialogLocation sdk={sdk} />, document.getElementById("root"));
  sdk.window.startAutoResizer();
}

async function openDialog(sdk, _currentValue, _config) {
  const result = await sdk.dialogs.openCurrentApp({
    position: "center",
    title: CTA,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    width: 1200,
    allowHeightOverflow: true,
  });

  if (!Array.isArray(result)) {
    return [];
  }

  return result.map((asset) => asset);
}

function validateParameters({ authToken, domain }) {
  if (!domain) {
    return "Please add Acquia DAM Domain";
  }

  if (!authToken) {
    return "Please add an auth token";
  }

  return null;
}
