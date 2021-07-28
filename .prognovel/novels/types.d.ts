export interface UnregisterContributor {
  contributor: string;
  where: string;
}

export interface TypoUnregisteredContributor {
  contributor: string;
  where: string;
  rating: number;
  fixedName: string;
}

export type RevenueShare = {
  [contributor: string]: number;
};

export type ChapterTitles = {
  [book: string]: {
    [chapter: string]: string;
  };
};

export interface FrontMatter {
  attributes: object;
  body: string;
}

export interface RevShareNovelMetadata {
  name: string;
  weight: string | number;
  paymentPointer: string;
  webfundingPaymentPointer?: string;
  roles: string[]
}