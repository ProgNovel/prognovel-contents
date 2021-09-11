import { load } from "js-yaml";
import { readFileSync } from "fs";
import { siteFiles } from "../_files";

export function getSiteContributors() {
  const contributorData = load(readFileSync(siteFiles().contributors));

  return Object.keys(contributorData).reduce((prev, cur) => {
    const data: any = {
      name: cur,
      paymentPointer: contributorData[cur].payment,
      weight: contributorData[cur].rate,
      webfundingPaymentPointer: `${contributorData[cur].payment}#${contributorData[cur].rate}`,
      roles: contributorData[cur].roles || [],
    };

    if (contributorData[cur].email) data.email = contributorData[cur].email;

    return [...prev, data];
  }, []);
}
