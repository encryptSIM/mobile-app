export const transformCountriesToCardData = (countries: Country[]): PackageCardData[] =>
  countries.map((country) => ({
    id: country.value,
    label: country.label,
    disabled: country.disabled,
    countryCode: country.value.toLowerCase(),
    region: country.value,
  }));

export const transformRegionsToCardData = (regions: Region[]): PackageCardData[] =>
  regions.map((region) => ({
    id: region.slug,
    label: region.title,
    imageUri: region.image,
    region: region.slug
  }));

export type PackageCardData = {
  id: string;
  label: string;
  disabled?: boolean;
  countryCode?: string;
  region?: string
  imageUri?: string;
};

export type Country = {
  value: string,
  label: string,
  disabled?: boolean
}

export type Region = {
  slug: string,
  title: string,
  image: string
}

export const countries = [
  {
    value: "AU",
    label: "Australia",
    disabled: false, // APAC
  },
  {
    value: "CN",
    label: "China",
    disabled: false, // APAC
  },
  {
    value: "JP",
    label: "Japan",
    disabled: false, // APAC
  },
  {
    value: "KR",
    label: "South Korea",
    disabled: false, // APAC
  },
  {
    value: "IN",
    label: "India",
    disabled: false, // APAC
  },
  {
    value: "SG",
    label: "Singapore",
    disabled: false, // APAC
  },
  {
    value: "NZ",
    label: "New Zealand",
    disabled: false, // APAC
  },
  {
    value: "US",
    label: "United States",
    disabled: false, // Major country
  },
  {
    value: "GB",
    label: "United Kingdom",
    disabled: false, // Major country
  },
  {
    value: "DE",
    label: "Germany",
    disabled: false, // Major country
  },
  {
    value: "FR",
    label: "France",
    disabled: false, // Major country
  },
  {
    value: "IT",
    label: "Italy",
    disabled: false, // Major country
  },
  {
    value: "CA",
    label: "Canada",
    disabled: false, // Major country
  },
  {
    value: "RU",
    label: "Russia",
    disabled: false, // Major country
  },
  {
    value: "BR",
    label: "Brazil",
    disabled: false, // Major country
  },
  {
    value: "ZA",
    label: "South Africa",
    disabled: false, // Major country
  },
  {
    value: "VN",
    label: "Vietnam",
    disabled: false, // APAC
  },
  {
    value: "PH",
    label: "Philippines",
    disabled: false, // APAC
  },
  {
    value: "TH",
    label: "Thailand",
    disabled: false, // APAC
  },
  {
    value: "MY",
    label: "Malaysia",
    disabled: false, // APAC
  },
  {
    value: "ID",
    label: "Indonesia",
    disabled: false, // APAC
  },
  {
    value: "HK",
    label: "Hong Kong SAR China",
    disabled: false, // APAC
  },
  {
    value: "TW",
    label: "Taiwan",
    disabled: false, // APAC
  },
  {
    value: "NP",
    label: "Nepal",
    disabled: false, // APAC
  },
  {
    value: "VU",
    label: "Vanuatu",
    disabled: false, // APAC
  },
  {
    value: "WS",
    label: "Samoa",
    disabled: false, // APAC
  },
  {
    value: "FI",
    label: "Finland",
    disabled: true, // Not major or APAC
  },
  {
    value: "SE",
    label: "Sweden",
    disabled: true, // Not major or APAC
  },
  {
    value: "CH",
    label: "Switzerland",
    disabled: true, // Not major or APAC
  },
  {
    value: "MX",
    label: "Mexico",
    disabled: true, // Not major or APAC
  },
  {
    value: "AR",
    label: "Argentina",
    disabled: true, // Not major or APAC
  },
  {
    value: "EG",
    label: "Egypt",
    disabled: true, // Not major or APAC
  },
  {
    value: "ES",
    label: "Spain",
    disabled: true, // Not major or APAC
  },
  {
    value: "PT",
    label: "Portugal",
    disabled: true, // Not major or APAC
  },
  {
    value: "PL",
    label: "Poland",
    disabled: true, // Not major or APAC
  },
  {
    value: "TR",
    label: "Türkiye",
    disabled: true, // Not major or APAC
  },
  {
    value: "QA",
    label: "Qatar",
    disabled: true, // Not major or APAC
  },
  {
    value: "SA",
    label: "Saudi Arabia",
    disabled: true, // Not major or APAC
  },
];

export const regions: Region[] = [
  {
    slug: 'world',
    title: 'World',
    image: 'https://cdn.airalo.com/images/5c6c78b0-1713-43f1-807e-7c62ab1904e9.png'
  },
  {
    slug: "europe",
    title: "Europe",
    image: "https://cdn.airalo.com/images/6ac17e60-8930-4042-89f0-4ac035d94295.png"
  },
  {
    slug: "africa",
    title: "Africa",
    image: "https://cdn.airalo.com/images/a10d3ea2-4f19-4ef0-b988-9f58120ca2b1.png"
  },
  {
    slug: "asia",
    title: "Asia",
    image: "https://cdn.airalo.com/images/6dd3b91a-c76a-4ca6-8eb9-ccf989eccac3.png"
  },
  {
    slug: "caribbean-islands",
    title: "Caribbean Islands",
    image: "https://cdn.airalo.com/images/6c5753bb-5300-4d6d-802e-8358d4c441c4.png"
  },
  {
    slug: "latin-america",
    title: "Latin America",
    image: "https://cdn.airalo.com/images/1f97527a-453f-466b-aa3c-95ef20e117fd.png"
  },
  {
    slug: "middle-east-and-north-africa",
    title: "Middle East and North Africa",
    image: "https://cdn.airalo.com/images/6fb3a348-219e-4fba-9ed9-a882980d6c3b.png"
  },
  {
    slug: "north-america",
    title: "North America",
    image: "https://cdn.airalo.com/images/bb120f49-7809-41c4-bd57-237d0ae994cd.png"
  },
  {
    slug: "oceania",
    title: "Oceania",
    image: "https://cdn.airalo.com/images/601554bc-d478-4afa-9d26-f3cb4ee50fc3.png"
  },
]

