import type { Metadata } from "next";
import Home from "../page";

// /preview is where the homelab room was built before it became the homepage.
// It stays as a second address for the same page, kept out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default Home;
