import React from "react";
import { Redirect } from "@docusaurus/router";

export default function Home() {
  return <Redirect to="/docs/foundations" />; // Change '/docs/intro' to your tutorial's path
}
